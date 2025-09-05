'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
