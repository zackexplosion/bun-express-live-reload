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

## To run the example app, clone this repo than

```bash
cd example
bun install
bun run dev
```

Default express port is 5555, and live reload port is 5454.
