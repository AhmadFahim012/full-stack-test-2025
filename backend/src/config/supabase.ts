import { createClient } from '@supabase/supabase-js';

// Load environment variables if not already loaded
if (!process.env.SUPABASE_URL) {
  require('dotenv').config();
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Environment variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
  });
  throw new Error('Missing Supabase environment variables');
}

// Client for general operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types (these would be generated from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
