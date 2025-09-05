import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  message: string;
}

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async verifyToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return this.handleResponse(response);
  }

  async getProfile() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  // Chat endpoints
  async getChats(): Promise<{ chats: Chat[]; count: number }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  async createChat(request: CreateChatRequest): Promise<{ chat: Chat; message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  async getChat(chatId: string): Promise<{ chat: Chat; messages: Message[]; count: number }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  async updateChatTitle(chatId: string, title: string): Promise<{ chat: Chat; message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ title }),
    });

    return this.handleResponse(response);
  }

  async deleteChat(chatId: string): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse(response);
  }

  async sendMessage(chatId: string, request: SendMessageRequest): Promise<SendMessageResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  async getChatMessages(chatId: string): Promise<{ messages: Message[]; count: number }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
