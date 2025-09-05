"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
exports.authRouter = router;
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                error: 'Token is required'
            });
            return;
        }
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({
                error: 'Invalid or expired token'
            });
            return;
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
            },
            valid: true
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Missing or invalid authorization header'
            });
            return;
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({
                error: 'Invalid or expired token'
            });
            return;
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
            }
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
//# sourceMappingURL=auth.js.map