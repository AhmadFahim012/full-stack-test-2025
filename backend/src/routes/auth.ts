import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * Verify Supabase token
 * POST /api/auth/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required' 
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      valid: true
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export { router as authRouter };
