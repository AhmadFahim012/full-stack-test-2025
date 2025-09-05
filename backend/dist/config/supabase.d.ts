export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
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
//# sourceMappingURL=supabase.d.ts.map