"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const supabase_1 = require("../config/supabase");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Missing or invalid authorization header'
            });
            return;
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            console.log('Invalid or expired token:', error?.message);
            res.status(401).json({
                error: 'Invalid or expired token',
                details: error?.message
            });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email || '',
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: 'Internal server error during authentication'
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map