"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const supabase_1 = require("../config/supabase");
const uuid_1 = require("uuid");
class DatabaseService {
    constructor() { }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async createChat(request) {
        const chatData = {
            id: (0, uuid_1.v4)(),
            user_id: request.user_id,
            title: request.title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase_1.supabaseAdmin
            .from('chats')
            .insert(chatData)
            .select()
            .single();
        if (error) {
            console.error('Error creating chat:', error);
            throw new Error(`Failed to create chat: ${error.message}`);
        }
        return data;
    }
    async getUserChats(userId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error) {
            console.error('Error fetching user chats:', error);
            throw new Error(`Failed to fetch chats: ${error.message}`);
        }
        return data || [];
    }
    async getChat(chatId, userId) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .eq('user_id', userId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching chat:', error);
            throw new Error(`Failed to fetch chat: ${error.message}`);
        }
        return data;
    }
    async updateChatTitle(chatId, userId, title) {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('chats')
            .update({
            title,
            updated_at: new Date().toISOString()
        })
            .eq('id', chatId)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) {
            console.error('Error updating chat title:', error);
            throw new Error(`Failed to update chat: ${error.message}`);
        }
        return data;
    }
    async deleteChat(chatId, userId) {
        const { error: messagesError } = await supabase_1.supabaseAdmin
            .from('messages')
            .delete()
            .eq('chat_id', chatId);
        if (messagesError) {
            console.error('Error deleting chat messages:', messagesError);
            throw new Error(`Failed to delete chat messages: ${messagesError.message}`);
        }
        const { error: chatError } = await supabase_1.supabaseAdmin
            .from('chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', userId);
        if (chatError) {
            console.error('Error deleting chat:', chatError);
            throw new Error(`Failed to delete chat: ${chatError.message}`);
        }
    }
    async createMessage(request) {
        const messageData = {
            id: (0, uuid_1.v4)(),
            chat_id: request.chat_id,
            role: request.role,
            content: request.content,
            created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .insert(messageData)
            .select()
            .single();
        if (error) {
            console.error('Error creating message:', error);
            throw new Error(`Failed to create message: ${error.message}`);
        }
        return data;
    }
    async getChatMessages(chatId, userId) {
        const chat = await this.getChat(chatId, userId);
        if (!chat) {
            throw new Error('Chat not found or access denied');
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) {
            console.error('Error fetching chat messages:', error);
            throw new Error(`Failed to fetch messages: ${error.message}`);
        }
        return data || [];
    }
    async getLatestMessage(chatId, userId) {
        const chat = await this.getChat(chatId, userId);
        if (!chat) {
            throw new Error('Chat not found or access denied');
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching latest message:', error);
            throw new Error(`Failed to fetch latest message: ${error.message}`);
        }
        return data;
    }
    async updateChatTimestamp(chatId, userId) {
        const { error } = await supabase_1.supabaseAdmin
            .from('chats')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', chatId)
            .eq('user_id', userId);
        if (error) {
            console.error('Error updating chat timestamp:', error);
            throw new Error(`Failed to update chat timestamp: ${error.message}`);
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=databaseService.js.map