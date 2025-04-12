'use client';

import { useEffect, useMemo, useState } from 'react';
import { Authorizer, ResponseTypes } from '@authorizerdev/authorizer-js';

const LoginPage = () => {
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const authorizer = useMemo(() => {
    const authorizerURL = process.env.NEXT_PUBLIC_AUTHORIZER_URL?.trim() || '';
    const clientID = process.env.NEXT_PUBLIC_AUTHORIZER_CLIENT_ID?.trim() || '';
    const redirectURL = process.env.NEXT_PUBLIC_REDIRECT_URL?.trim() || '';

    if (!authorizerURL || !clientID || !redirectURL) {
      console.warn('⚠️ Missing one or more Authorizer env variables');
    }

    return new Authorizer({
      authorizerURL,
      clientID,
      redirectURL,
    });
  }, []);

  const refreshToken = async () => {
    try {
      const res = await authorizer.getSession(); // will auto-refresh if refresh token exists
      if (res?.data?.access_token) {
        localStorage.setItem('authorizer-token', res.data.access_token);
        setLoginStatus('success');
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed', err);
    }
    setLoginStatus('error');
    return false;
  };

  useEffect(() => {
    const checkLogin = async () => {
      setLoginStatus('loading');
      try {
        const session = await authorizer.getSession();

        if (session?.data?.access_token) {
          localStorage.setItem('authorizer-token', session.data.access_token);
        }

        if (session?.data?.user) {
          setLoginStatus('success');
          window.location.href = '/dashboard';
        } else {
          // Try to refresh token if session is missing
          await refreshToken();
        }
      } catch (err) {
        console.error('Login check failed', err);
        setLoginStatus('error');
      }
    };

    checkLogin();
  }, [authorizer]);

  const login = () => {
    authorizer.authorize({
      response_type: ResponseTypes.Code,
      response_mode: 'web_message',
      use_refresh_token: true,
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <button
        onClick={login}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign In with Authorizer
      </button>
      {loginStatus === 'loading' && <p className="mt-4">Checking session...</p>}
      {loginStatus === 'error' && <p className="mt-4 text-red-500">Login failed. Please try again.</p>}
    </main>
  );
};

export default LoginPage;
