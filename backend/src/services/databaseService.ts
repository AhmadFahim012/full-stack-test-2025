import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface CreateChatRequest {
  title: string;
  user_id: string;
}

export interface CreateMessageRequest {
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
}

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Create a new chat for a user
   */
  async createChat(request: CreateChatRequest): Promise<Chat> {
    const chatData = {
      id: uuidv4(),
      user_id: request.user_id,
      title: request.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
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

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabaseAdmin
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

  /**
   * Get a specific chat by ID (with user ownership check)
   */
  async getChat(chatId: string, userId: string): Promise<Chat | null> {
    const { data, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Chat not found
      }
      console.error('Error fetching chat:', error);
      throw new Error(`Failed to fetch chat: ${error.message}`);
    }

    return data;
  }

  /**
   * Update chat title
   */
  async updateChatTitle(chatId: string, userId: string, title: string): Promise<Chat> {
    const { data, error } = await supabaseAdmin
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

  /**
   * Delete a chat and all its messages
   */
  async deleteChat(chatId: string, userId: string): Promise<void> {
    // First delete all messages in the chat
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      throw new Error(`Failed to delete chat messages: ${messagesError.message}`);
    }

    // Then delete the chat
    const { error: chatError } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (chatError) {
      console.error('Error deleting chat:', chatError);
      throw new Error(`Failed to delete chat: ${chatError.message}`);
    }
  }

  /**
   * Create a new message in a chat
   */
  async createMessage(request: CreateMessageRequest): Promise<Message> {
    const messageData = {
      id: uuidv4(),
      chat_id: request.chat_id,
      role: request.role,
      content: request.content,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
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

  /**
   * Get all messages for a chat (with user ownership check)
   */
  async getChatMessages(chatId: string, userId: string): Promise<Message[]> {
    // First verify the chat belongs to the user
    const chat = await this.getChat(chatId, userId);
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const { data, error } = await supabaseAdmin
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

  /**
   * Get the latest message from a chat (for updating chat title)
   */
  async getLatestMessage(chatId: string, userId: string): Promise<Message | null> {
    // First verify the chat belongs to the user
    const chat = await this.getChat(chatId, userId);
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No messages found
      }
      console.error('Error fetching latest message:', error);
      throw new Error(`Failed to fetch latest message: ${error.message}`);
    }

    return data;
  }

  /**
   * Update chat's updated_at timestamp
   */
  async updateChatTimestamp(chatId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
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
