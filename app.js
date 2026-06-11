const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
// dotenv.config({ path: "./config.env" });

app.get("/", (req, res) => {});

module.exports = app;
