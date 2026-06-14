const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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

const renderProfile = (req, res) => {
  res.render("Profile/profile", {
    authUser: req.authUser,
    success: req.query.success || "",
    error: req.query.error || "",
  });
};

const updateProfile = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const currentPassword = req.body.currentPassword || "";
    const newPassword = req.body.newPassword || "";

    if (!name || !email) {
      return res.redirect(
        "/api/v1/profile?error=Name%20and%20email%20are%20required.",
      );
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.authUser._id },
    });
    if (existingUser) {
      return res.redirect(
        "/api/v1/profile?error=Email%20is%20already%20in%20use.",
      );
    }

    const user = await User.findById(req.authUser._id).select("+password");
    if (!user) {
      return res.redirect(
        "/api/v1/profile?error=Unable%20to%20load%20profile.",
      );
    }

    user.name = name;
    user.email = email;

    if (newPassword) {
      if (!currentPassword) {
        return res.redirect(
          "/api/v1/profile?error=Current%20password%20is%20required%20to%20change%20password.",
        );
      }

      const matches = await bcrypt.compare(
        currentPassword,
        user.password || "",
      );
      if (!matches) {
        return res.redirect(
          "/api/v1/profile?error=Current%20password%20is%20incorrect.",
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const token = buildToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(
      "/api/v1/profile?success=Profile%20updated%20successfully.",
    );
  } catch (error) {
    return res.redirect(
      "/api/v1/profile?error=Unable%20to%20update%20profile%20right%20now.",
    );
  }
};

module.exports = {
  renderProfile,
  updateProfile,
};
