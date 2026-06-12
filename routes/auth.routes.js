const express = require("express");
const router = express.Router();
const {
  otpCreation,
  signup,
  login,
} = require("../controllers/auth.controller");
const {
  auth,
  isAdmin,
  isPublisher,
  isVendor,
} = require("../middlewares/auth.middleware");

// ================= PUBLIC ROUTES =================
router.post("/send-otp", otpCreation);
router.post("/signup", signup);
router.post("/login", login);

// ================= TEST ROUTES =================
// Any Logged In User
router.get("/test", auth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Protected Route Accessed",
    user: req.user,
  });
});

// Admin Only
router.get("/admin", auth, isAdmin, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

// Publisher Only
router.get("/publisher", auth, isPublisher, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Publisher",
  });
});

// Vendor Only
router.get("/vendor", auth, isVendor, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Vendor",
  });
});

module.exports = router;
