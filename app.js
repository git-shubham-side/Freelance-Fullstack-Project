const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv").config();
// dotenv.config({ path: "./config.env" });
app.use(express.static(path.resolve("public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.get(["/", "/api/v1/home"], (req, res) => {
  res.render("Landing/dashboard");
});

//Auth Routes
app.get("/api/v1/login", (req, res) => {
  res.render("Login/login");
});
app.get("/api/v1/signup", (req, res) => {
  res.render("Auth/signup");
});

//Bussiness Portal Api Routes
//Bussiness-1
app.get("/api/v1/b1", (req, res) => {
  res.render("Farm/farmDashboard");
});
//Bussiness - 2
app.get("/api/v1/b2", (req, res) => {
  res.render("Hostel/hostel");
});
//Bussiness - 3
app.get("/api/v1/b3", (req, res) => {
  res.render("Underconstruction/underConstruction");
});

module.exports = app;
