'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!session && !isPending) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="max-w-lg w-full space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!session && !isPending) {
    return null;
  }

  return (
    <div className="max-w-lg w-full space-y-4 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 space-y-4 border border-gray-100">
        <div className="space-y-3">
          <div className="text-center">
            <div className="h-24 w-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl text-primary">
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Profile Information</h2>
          </div>
          
          <div className="space-y-5">
            <div className="bg-gray-100 rounded-lg p-4 py-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
              <p className="text-base text-gray-900">{session?.user?.email}</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 py-2">
              <label className="block text-sm font-bold text-gray-600 mb-1">Name</label>
              <p className="text-base text-gray-900">
                {session?.user?.name || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 