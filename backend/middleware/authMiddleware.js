const jwt = require("jsonwebtoken");
const { createGuestUser } =

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            // No authorization header, create guest user
            req.user = await createGuestUser();
            return next();
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            // No token, create guest user
            req.user = await createGuestUser();
            return next();
        }

        const decoded = jwt.decode(token, process.env.JWT_SECRET)

        req.user = decoded;

        next();
    } catch (error) {
        console.error('authMiddleware error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

