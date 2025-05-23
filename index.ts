import { BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT } from './live-reload.ts'

// require('./live-reload')

const autoReloadScriptUrl = `http://localhost:${BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT}/auto-reload.js`
const autoReloadScript = `<script src="${autoReloadScriptUrl}"></script>`

const expressMiddleware = function (req, res, next) {
  // Store a reference to the original res.render method
  const originalRender = res.render;

  res.render = function (view, options, callback) {
    if (typeof callback === 'function') {
      originalRender.call(res, view, options, callback);
      return next()
    }

    const defaultCallback = (err, html) => {

      if (err) {
        console.error(err)
        return next(err)
      }
      var htmlWithAutoReloadScript
      if (html.indexOf('</body>') === -1) {
        htmlWithAutoReloadScript = html + autoReloadScript
      } else {
        htmlWithAutoReloadScript = html.replace('</body>', `${autoReloadScript}</body>`)
      }

      res.send(htmlWithAutoReloadScript);
    }

    originalRender.call(res, view, options, defaultCallback);
  }

  next();
}


export default expressMiddleware