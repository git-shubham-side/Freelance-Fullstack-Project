const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const renderLogin = (req, res) => {
  const loginReturnTo = req.query.returnTo || "";
  const loginAction = loginReturnTo
    ? `/api/v1/login?returnTo=${encodeURIComponent(loginReturnTo)}`
    : "/api/v1/login";
  const signupHref = loginReturnTo
    ? `/api/v1/signup?returnTo=${encodeURIComponent(loginReturnTo)}`
    : "/api/v1/signup";
  const googleHref = loginReturnTo
    ? `/api/v1/auth/google?returnTo=${encodeURIComponent(loginReturnTo)}`
    : "/api/v1/auth/google";

  res.render("Auth/login", {
    error: null,
    email: "",
    returnTo: loginReturnTo,
    loginReturnTo,
    loginAction,
    signupHref,
    googleHref,
  });
};

const renderLegacyLogin = renderLogin;

const renderSignup = (req, res) => {
  const signupReturnTo = req.query.returnTo || "";
  const signupAction = signupReturnTo
    ? `/api/v1/signup?returnTo=${encodeURIComponent(signupReturnTo)}`
    : "/api/v1/signup";
  const loginHref = signupReturnTo
    ? `/api/v1/login?returnTo=${encodeURIComponent(signupReturnTo)}`
    : "/api/v1/login";
  const googleHref = signupReturnTo
    ? `/api/v1/auth/google?returnTo=${encodeURIComponent(signupReturnTo)}`
    : "/api/v1/auth/google";

  res.render("Auth/signup", {
    error: null,
    name: "",
    email: "",
    returnTo: signupReturnTo,
    signupReturnTo,
    signupAction,
    loginHref,
    googleHref,
  });
};

const renderLegacySignup = renderSignup;

const buildToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );

const resolveReturnTo = (request) => {
  const returnTo =
    request.query.returnTo ||
    request.query.state ||
    request.body.returnTo ||
    "";

  if (typeof returnTo === "string" && returnTo.startsWith("/")) {
    return returnTo;
  }

  return process.env.AUTH_SUCCESS_REDIRECT || "/api/v1/b1";
};

const sendAuthenticatedRedirect = (res, user, redirectTo) => {
  const token = buildToken(user);
  res.cookie("token", token, authCookieOptions);
  res.redirect(redirectTo);
};

const signup = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).render("Auth/signup", {
        error: "All fields are required.",
        name,
        email,
        returnTo: req.body.returnTo || "",
        signupReturnTo: req.body.returnTo || "",
        signupAction: req.body.returnTo
          ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/signup",
        loginHref: req.body.returnTo
          ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/login",
        googleHref: req.body.returnTo
          ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/auth/google",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render("Auth/signup", {
        error: "Passwords do not match.",
        name,
        email,
        returnTo: req.body.returnTo || "",
        signupReturnTo: req.body.returnTo || "",
        signupAction: req.body.returnTo
          ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/signup",
        loginHref: req.body.returnTo
          ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/login",
        googleHref: req.body.returnTo
          ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/auth/google",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).render("Auth/signup", {
        error: "An account with this email already exists.",
        name,
        email,
        returnTo: req.body.returnTo || "",
        signupReturnTo: req.body.returnTo || "",
        signupAction: req.body.returnTo
          ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/signup",
        loginHref: req.body.returnTo
          ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/login",
        googleHref: req.body.returnTo
          ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/auth/google",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    return sendAuthenticatedRedirect(res, user, resolveReturnTo(req));
  } catch (error) {
    return res.status(500).render("Auth/signup", {
      error: "Unable to create the account right now.",
      name: req.body.name || "",
      email: req.body.email || "",
      returnTo: req.body.returnTo || "",
      signupReturnTo: req.body.returnTo || "",
      signupAction: req.body.returnTo
        ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/signup",
      loginHref: req.body.returnTo
        ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/login",
      googleHref: req.body.returnTo
        ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/auth/google",
    });
  }
};

const login = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).render("Auth/login", {
        error: "Email and password are required.",
        email,
        returnTo: req.body.returnTo || "",
        loginReturnTo: req.body.returnTo || "",
        loginAction: req.body.returnTo
          ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/login",
        signupHref: req.body.returnTo
          ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/signup",
        googleHref: req.body.returnTo
          ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/auth/google",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).render("Auth/login", {
        error: "Invalid email or password.",
        email,
        returnTo: req.body.returnTo || "",
        loginReturnTo: req.body.returnTo || "",
        loginAction: req.body.returnTo
          ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/login",
        signupHref: req.body.returnTo
          ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/signup",
        googleHref: req.body.returnTo
          ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
          : "/api/v1/auth/google",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password || "");

    if (!passwordMatches) {
      return res.status(401).render("Auth/login", {
        error: "Invalid email or password.",
        email,
      });
    }

    return sendAuthenticatedRedirect(res, user, resolveReturnTo(req));
  } catch (error) {
    return res.status(500).render("Auth/login", {
      error: "Unable to sign in right now.",
      email: req.body.email || "",
      returnTo: req.body.returnTo || "",
      loginReturnTo: req.body.returnTo || "",
      loginAction: req.body.returnTo
        ? `/api/v1/login?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/login",
      signupHref: req.body.returnTo
        ? `/api/v1/signup?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/signup",
      googleHref: req.body.returnTo
        ? `/api/v1/auth/google?returnTo=${encodeURIComponent(req.body.returnTo)}`
        : "/api/v1/auth/google",
    });
  }
};

const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.redirect("/api/v1/login");
  }

  return sendAuthenticatedRedirect(res, req.user, resolveReturnTo(req));
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.redirect("/");
};

const me = (req, res) => {
  res.json({
    user: {
      id: req.authUser._id,
      name: req.authUser.name,
      email: req.authUser.email,
      authProvider: req.authUser.authProvider,
      avatar: req.authUser.avatar,
    },
  });
};

module.exports = {
  renderLogin,
  renderLegacyLogin,
  renderSignup,
  renderLegacySignup,
  signup,
  login,
  googleCallback,
  logout,
  me,
};
