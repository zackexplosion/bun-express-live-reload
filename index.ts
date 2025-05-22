// import liveReload from './live-reload.ts'

require('./live-reload')

const BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT = process.env.BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT || 3001;

const expressMiddleware = function (req, res, next) {
  // Store a reference to the original res.render method
  const originalRender = res.render;
  const autoReloadScriptUrl = `http://localhost:${BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT}/auto-reload.js`

  res.render = function (view, options, callback) {
    if (typeof callback === 'function') {
      originalRender.call(res, view, options, callback);
      return next()
    }

    const defaultCallback = (err, html) => {

      // Now 'html' is a string containing the rendered Pug output
      let modifiedHtml = html.replace('initial', 'modified by server');

      // Example: Add a new script tag (though usually better done in Pug)
      modifiedHtml = modifiedHtml.replace('</body>', `<script src="${autoReloadScriptUrl}"></script></body>`);
      res.send(modifiedHtml);
    }

    originalRender.call(res, view, options, defaultCallback);

  }

  next();
}


export default expressMiddleware