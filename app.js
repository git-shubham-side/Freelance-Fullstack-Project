const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv").config();
// dotenv.config({ path: "./config.env" });
app.use(express.static(path.resolve("public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.get("/", (req, res) => {
  res.render("Landing/dashboard");
});

module.exports = app;
