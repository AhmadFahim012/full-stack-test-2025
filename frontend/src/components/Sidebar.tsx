'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { apiClient, Chat } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  MessageSquare, 
  MoreVertical, 
  LogOut, 
  User,
  Trash2,
  Edit3,
  Loader2
} from 'lucide-react';

export function Sidebar() {
  const [newChatTitle, setNewChatTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();

  // Load chats when component mounts
  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getChats();
        setChats(response.chats);
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) {
      toast.error('Please enter a chat title');
      return;
    }

    try {
      const response = await apiClient.createChat({ title: newChatTitle.trim() });
      setNewChatTitle('');
      setIsCreateDialogOpen(false);
      
      // Refresh chats list
      const updatedChats = await apiClient.getChats();
      setChats(updatedChats.chats);
      
      router.push(`/chat/${response.chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await apiClient.deleteChat(chatId);
        
        // Refresh chats list
        const updatedChats = await apiClient.getChats();
        setChats(updatedChats.chats);
        
        // If we're currently viewing this chat, redirect to home
        if (pathname === `/chat/${chatId}`) {
          router.push('/chat');
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        toast.error('Failed to delete chat');
      }
    }
  };

  const handleEditChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveEdit = async () => {
    if (!editingChatId || !editingTitle.trim()) return;
    
    try {
      await apiClient.updateChatTitle(editingChatId, editingTitle.trim());
      setEditingChatId(null);
      setEditingTitle('');
      
      // Refresh chats list
      const updatedChats = await apiClient.getChats();
      setChats(updatedChats.chats);
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Turing Test</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chat Title</Label>
                <Input
                  id="title"
                  placeholder="Enter chat title"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateChat();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateChat} disabled={loading}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No chats yet</p>
            <p className="text-sm">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Card 
                key={chat.id}
                className={`cursor-pointer p-0 transition-colors hover:bg-gray-100 ${
                  pathname === `/chat/${chat.id}` ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingChatId(null);
                              setEditingTitle('');
                            }
                          }}
                          className="h-6 text-sm"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </h3>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEditChat(chat, e)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}