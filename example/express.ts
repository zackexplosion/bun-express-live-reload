import express from "express"
import liveReload from "bun-express-live-reload"

const app = express()

// NODE_ENV might be undefined in development mode
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  app.use(liveReload);
}

// Set Pug as the view engine
app.set("view engine", "pug")

app.get("/", (req, res) => {
  res.render("index")
});


const EXPRESS_PORT = process.env.EXPRESS_PORT || 5555;
app.listen(EXPRESS_PORT, () => {
  console.log(`Server is running on http://localhost:${EXPRESS_PORT}`);
});