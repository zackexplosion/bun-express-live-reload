import { plugin, type BunPlugin } from "bun"

export const BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT = process.env.BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT || 5454

const clientScript = `
  (function() {
    console.log('LiveReload: 客戶端腳本已載入，正在嘗試連線到 WebSocket 伺服器...');
    const ws = new WebSocket('ws://localhost:${BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT}');

    ws.onclose = () => {
      // 如果 WebSocket 連線斷開，這表示伺服器已經關閉或重啟了。
      // 等待一小段時間（讓伺服器有時間重新啟動），然後重新載入頁面。
      setTimeout(() => {
        console.log('LiveReload: 偵測到伺服器重啟或斷線，嘗試重新載入頁面...');
        window.location.reload();
      }, 300); // 等待 1 秒
    };

    // 當 WebSocket 連線發生錯誤時觸發。
    // 除錯用 🤔
    ws.onerror = (error) => {
      console.error('LiveReload: 客戶端 WebSocket 錯誤:', error);
    };
  })();
`;


function startLiveReloadServer() {
  console.log(
    `Live reload server is running on port: ${BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT}`
  )
  Bun.serve({
    port: BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT, // WebSocket 伺服器的埠號
    fetch(req, server) {
      // 嘗試將 HTTP 請求升級為 WebSocket 連線。
      if (server.upgrade(req)) {
        return; // 如果升級成功，則不處理 HTTP 請求。
      }

      const url = new URL(req.url);

      switch (url.pathname) {
        case "/auto-reload.js": {
          return new Response(clientScript);
        }
        default: {
          return new Response("Hello World! I am Auto Reload Server!");
        }
      }
    },
    websocket: {
      // 當有新的 WebSocket 連線建立時觸發。
      open(ws) {
        console.log('LiveReload: Browser client has connected to the server.')
      },
      message(ws) {
        console.log('LiveReload:', ws)
      },
      close(ws) {
        console.log(
          "LiveReload: Browser client has disconnected from the server."
        );
      },
    },
  });
}

const LiveReloadPlugin: BunPlugin = {
  name: 'LiveReload',
  setup(build) {
    startLiveReloadServer()
  },
};

plugin(LiveReloadPlugin)

