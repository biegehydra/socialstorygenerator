'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading-google' | 'loading-magic-link' | 'success-google' | 'success-magic-link' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setStatus('loading-google');
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL + '/'
      });
      setStatus('success-google');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus('loading-magic-link');
      const { error: magicLinkError } = await authClient.signIn.magicLink({
        email,
        callbackURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL + '/'
      });
      
      if (magicLinkError) throw new Error(magicLinkError.message);
      
      setStatus('success-magic-link');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    }
  };

  if (status === 'success-magic-link') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div>
          <p className="text-sm font-medium text-green-800 text-center bg-green-50 p-4 -mt-6 rounded-lg">
            Check your email for the magic link!  
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div>
        <button
          onClick={handleGoogleSignIn}
          disabled={status.includes('loading')}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {status === 'loading-google' ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={status.includes('loading')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {status === 'loading-magic-link' ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      {status === 'error' && error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 