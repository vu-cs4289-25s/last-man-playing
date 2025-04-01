/************************************************
 * File: backend/middleware/authMiddleware.js
 ************************************************/
const jwt = require('jsonwebtoken');

/**
 * verifyToken - Ensures an Authorization header is present and valid.
 * Decodes the JWT and attaches the payload to req.user
 */
module.exports = (req, res, next) => {
  try {
    // 1. Get the Authorization header
    let authHeader = req.headers.authorization; // e.g. "Bearer abc123"
    if (!authHeader) {
      return res.status(403).json({ message: 'No token provided in Authorization header.' });
    }

    // 2. Check if it starts with "Bearer "
    if (authHeader.startsWith('Bearer ')) {
      authHeader = authHeader.slice(7, authHeader.length); // remove "Bearer "
    } else {
      // If you strictly require the "Bearer " prefix
      return res.status(401).json({ message: 'Authorization header must begin with "Bearer ".' });
    }

    // 3. Verify the token
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    req.user = decoded; // e.g. { userId: '123', ... }

    // 4. Pass control to next middleware/route
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    // If token is invalid or expired, respond with 401
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};