const jwt = require("jsonwebtoken");

const User = require("../models/User");

const getTokenFromRequest = (req) => {
  const authorizationHeader = req.headers.authorization || "";

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  if (authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.slice(7);
  }

  return null;
};

const rejectUnauthenticated = (req, res, message) => {
  if (req.accepts("html") && req.method === "GET") {
    return res.redirect("/api/v1/login");
  }

  return res.status(401).json({ message });
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return rejectUnauthenticated(req, res, "Authentication required.");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return rejectUnauthenticated(req, res, "Authentication required.");
    }

    req.authUser = user;
    return next();
  } catch (error) {
    return rejectUnauthenticated(req, res, "Invalid or expired token.");
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (user) {
      req.authUser = user;
      if (res?.locals) {
        res.locals.authUser = user;
      }
    }

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
