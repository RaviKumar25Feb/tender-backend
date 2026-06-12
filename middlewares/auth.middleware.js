const jwt = require("jsonwebtoken");
// ================= AUTH =================
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating token",
    });
  }
};

// ================= ADMIN =================
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This route is accessible only for Admin",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

// ================= PUBLISHER =================
exports.isPublisher = async (req, res, next) => {
  try {
    if (req.user.role !== "publisher") {
      return res.status(403).json({
        success: false,
        message: "This route is accessible only for Publisher",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

// ================= VENDOR =================
exports.isVendor = async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "This route is accessible only for Vendor",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};
