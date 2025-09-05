'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, Message, Chat } from '@/lib/api';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getChat(chatId);
      setCurrentChat(response.chat);
      setMessages(response.messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
      router.push('/chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sendingMessage) {
      return;
    }

    const messageToSend = message.trim();
    setMessage('');
    setSendingMessage(true);

    try {
      // Optimistically add user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        role: 'user',
        content: messageToSend,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempUserMessage]);

      // Send message to backend
      const response = await apiClient.sendMessage(chatId, { message: messageToSend });
      
      // Replace temp message with real messages
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== tempUserMessage.id),
        response.userMessage,
        response.assistantMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessage(messageToSend); // Restore message on error
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chat not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/chat')}
          >
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {currentChat.title}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white ml-3'
                      : 'bg-gray-200 text-gray-600 mr-3'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {sendingMessage && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 mr-3 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-6">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendingMessage}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendingMessage}
            size="sm"
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
