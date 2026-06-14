const express = require("express");

const { passport, isGoogleAuthConfigured } = require("../config/passport");
const { requireAuth } = require("../middleware/auth");
const {
  renderLogin,
  renderLegacyLogin,
  renderSignup,
  renderLegacySignup,
  signup,
  login,
  googleCallback,
  logout,
  me,
} = require("../controllers/authController");

const router = express.Router();

const googleUnavailable = (req, res) => {
  return res.status(503).render("Auth/login", {
    error: "Google auth is not configured yet.",
    email: "",
  });
};

router.get("/login", renderLogin);
router.get("/legacy-login", renderLegacyLogin);
router.post("/login", login);

router.get("/signup", renderSignup);
router.get("/legacy-signup", renderLegacySignup);
router.post("/signup", signup);

if (isGoogleAuthConfigured) {
  router.get("/auth/google", (req, res, next) =>
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: req.query.returnTo || "",
    })(req, res, next),
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/api/v1/login",
    }),
    googleCallback,
  );
} else {
  router.get("/auth/google", googleUnavailable);
  router.get("/auth/google/callback", googleUnavailable);
}

router.get("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
