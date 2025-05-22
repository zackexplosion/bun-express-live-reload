// 這個 Bun 插件用於在開發伺服器重啟時自動重新載入瀏覽器。
import { plugin, type BunPlugin } from "bun"
// 儲存所有連接到 WebSocket 伺服器的客戶端。
const clients: Set<WebSocket> = new Set();
// WebSocket 伺服器將監聽的埠號。
// 請確保這個埠號在你的系統中是可用的，例如 3001 或 8081。
const BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT = process.env.BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT || 3001;

const clientScript = `
  (function() {
    const ws = new WebSocket('ws://localhost:${BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT}');

    // 這裡的 onmessage 將不會收到來自此插件的 'reload' 訊息，
    // 因為我們移除了伺服器端發送 'reload' 的邏輯（build.onEnd 不存在）。
    // 除非你在伺服器端有其他機制發送訊息。
    ws.onmessage = (event) => {
      // 為了兼容性保留，如果未來 Bun API 增加此功能或您有其他用途。
      if (event.data === 'reload') {
        console.log('AutoReload: 收到重載指令，正在重新載入頁面...');
        window.location.reload();
      }
    };

    // 當 WebSocket 連線關閉時觸發。
    ws.onclose = () => {
      console.log('AutoReload: WebSocket 連線已斷開。');
      // 如果 WebSocket 連線斷開，這強烈暗示了伺服器已經關閉或重啟了。
      // 在這種情況下，等待一小段時間（讓伺服器有時間重新啟動），然後重新載入頁面。
      setTimeout(() => {
        console.log('AutoReload: 偵測到伺服器重啟或斷線，嘗試重新載入頁面...');
        window.location.reload();
      }, 300); // 等待 1 秒
    };

    // 當 WebSocket 連線發生錯誤時觸發。
    ws.onerror = (error) => {
      console.error('AutoReload: 客戶端 WebSocket 錯誤:', error);
    };

    console.log('AutoReload: 客戶端腳本已載入，正在嘗試連線到 WebSocket 伺服器...');
  })();
`;



// 定義 Bun 插件
const autoReloadPlugin: BunPlugin = {
  name: 'AutoReload', // 插件的名稱
  setup(build) {
    // 啟動一個 WebSocket 伺服器來處理瀏覽器客戶端的連線。
    // 這個 WebSocket 伺服器會獨立於 Bun 的應用程式伺服器運行。
    // 只有當整個 Bun 進程停止並重新啟動時，這個 WebSocket 伺服器才會關閉並重新啟動。
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
          console.log('AutoReload: 瀏覽器客戶端已連線。');
          clients.add(ws); // 將新的客戶端加入到集合中。
        },
        // 當 WebSocket 連線關閉時觸發。
        close(ws) {
          console.log('AutoReload: 瀏覽器客戶端已斷開連線。');
          clients.delete(ws); // 從集合中移除斷開的客戶端。
        },
        // 當從客戶端接收到訊息時觸發。
        // 在這個應用中，我們不預期客戶端會發送訊息。
        message(ws, message) {
          // console.log(`AutoReload: 收到來自客戶端的訊息: ${message}`);
        },
        // 當 WebSocket 發生錯誤時觸發。
        error(ws, error) {
          console.error('AutoReload: WebSocket 錯誤:', error);
        },
      },
    });
  },
};

plugin(autoReloadPlugin)
