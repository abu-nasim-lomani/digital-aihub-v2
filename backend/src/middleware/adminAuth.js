/**
 * Middleware to check if user is an admin
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, res, next) => {
    try {
        // Check if user is authenticated (should be set by authenticate middleware)
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user has admin role (support both old isAdmin and new role field)
        const isAdmin = req.user.isAdmin === true || req.user.role === 'admin';

        if (!isAdmin) {
            return res.status(403).json({
                error: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
