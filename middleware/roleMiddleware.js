// middleware/roleMiddleware.js
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Forbidden: Admins only' });
}

// Middleware to check if user is teacher
function isTeacher(req, res, next) {
    if (req.user && req.user.role === 'teacher') return next();
    return res.status(403).json({ message: 'Forbidden: Teachers only' });
}

module.exports = { isAdmin, isTeacher, roleMiddleware };
