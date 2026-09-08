import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Check cookie token
    let token = req.cookies.token;
    console.log("🔍 Auth Middleware - Cookies:", req.cookies);
    console.log("🔍 Auth Middleware - Has token in cookie:", !!token);

    // 2. If no cookie, check Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Bearer <token>
      console.log("🔍 Auth Middleware - Token from Authorization header:", !!token);
    }

    // 3. Still no token? Unauthorized
    if (!token) {
      console.log("❌ Auth Middleware - No token found");
      return res.status(401).json({
        message: "User not authenticated. Please login again.",
        success: false,
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      console.log("❌ Auth Middleware - Token decoded but invalid");
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    console.log("✅ Auth Middleware - Token verified, User ID:", decoded.userId);
    req.id = decoded.userId;
    next();

  } catch (error) {
    console.log("❌ Auth Middleware Error:", error.message);
    return res.status(401).json({
      message: error.name === 'JsonWebTokenError' ? "Invalid or expired token. Please login again." : "Token verification failed",
      success: false,
    });
  }
};

export default isAuthenticated;
