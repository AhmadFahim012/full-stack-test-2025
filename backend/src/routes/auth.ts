import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * Verify Supabase token
 * POST /api/auth/verify
 */
router.post('/verify', async (req, res): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ 
        error: 'Token is required' 
      });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
       res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
      return
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
router.get('/profile', async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Missing or invalid authorization header' 
      });
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

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
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export { router as authRouter };
