const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../controllers/Auth");
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");

// Routes for Login, Signup, and Authentication

router.post("/login", login);

router.post("/signup", signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);

router.post("/changepassword", auth, changePassword);

router.post("/reset-password-token", resetPasswordToken);

router.post("/reset-password", resetPassword);

module.exports = router;
