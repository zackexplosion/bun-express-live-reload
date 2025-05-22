# Bun Express Live Reload

This package can help you do the live reload for your express app with Bun

Made with Bun built-in websocket function.

## To use in your express app

```bash
bun install -d bun-express-live-reload
```

```js
import liveReload from "bun-express-live-reload"

const app = express()

// NODE_ENV might be undefined in development mode
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  app.use(liveReload);
}

// etc......

```

the default live reload server port is 5454, you can change it by setting up environment variable.

`.env` file

```sh
BUN_EXPRESS_LIVE_RELOAD_WEBSOCKET_PORT=6464
```

## To run the example app, clone this repo than

```sh
cd example
bun install
bun run dev
```

Default express port is 5555, and live reload port is 5454.
