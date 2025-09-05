'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export default function ChatHomePage() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const response = await apiClient.createChat({ title: 'New Chat' });
      router.push(`/chat/${response.chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-300" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to Turing Test
        </h1>
        <p className="text-gray-600 mb-8">
          Start a new conversation or select an existing chat from the sidebar to begin.
        </p>
        {/* <Button onClick={handleNewChat} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Start New Chat
        </Button> */}
      </div>
    </div>
  );
}
