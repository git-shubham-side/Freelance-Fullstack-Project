const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const { passport } = require("./config/passport");
const { optionalAuth } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const hostelRoutes = require("./routes/hostel");

app.use(express.static(path.resolve("public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(optionalAuth);
app.use((req, res, next) => {
  res.locals.authUser = req.authUser || null;
  res.locals.currentPath = req.originalUrl || "/";
  next();
});

app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.get(["/", "/api/v1/home"], (req, res) => {
  res.render("Landing/dashboard");
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", hostelRoutes);

//Bussiness Portal Api Routes
//Bussiness-1
app.get("/api/v1/b1", (req, res) => {
  res.render("Farm/farmDashboard");
});
//Bussiness - 3
app.get("/api/v1/b3", (req, res) => {
  res.render("Underconstruction/underConstruction");
});

module.exports = app;
