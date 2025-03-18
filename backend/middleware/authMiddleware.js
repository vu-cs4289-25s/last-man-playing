const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        const decoded = jwt.decode(token, process.env.JWT_SECRET)

        req.user = decoded;

        next();
    } catch (error) {
        console.error('authMiddleware error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

