'use client';

import { Authorizer } from '@authorizerdev/authorizer-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const authorizer = new Authorizer({
  authorizerURL: process.env.NEXT_PUBLIC_AUTHORIZER_URL!,
  clientID: process.env.NEXT_PUBLIC_AUTHORIZER_CLIENT_ID!,
  redirectURL: typeof window !== 'undefined' ? window.location.origin : '',
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const { data, errors } = await authorizer.login({
        email,
        password,
      });

      if (errors?.length || !data?.access_token) {
        setError('Login failed. Check credentials.');
        return;
      }

      // ✅ Save token in localStorage for booking to use
      localStorage.setItem('authorizer-token', data.access_token);

      // ✅ Optional: store ID token too if needed later
      localStorage.setItem('authorizer-id-token', data.id_token);

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="w-full p-2 bg-black text-white rounded"
      >
        Log in
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
