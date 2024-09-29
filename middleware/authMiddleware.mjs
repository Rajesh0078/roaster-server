import jwt from "jsonwebtoken";

// Middleware for protecting routes
export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id, // Get user ID from token
      email: decoded.email, // Get user email from token
    }; // Attach user information to the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
