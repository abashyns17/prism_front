'use client';

import { AuthorizerProvider } from '@authorizerdev/authorizer-react';

export const AuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthorizerProvider
      config={{
        authorizerURL: process.env.NEXT_PUBLIC_AUTHORIZER_URL!,
        redirectURL: typeof window !== 'undefined' ? window.location.origin : '',
      }}
    >
      {children}
    </AuthorizerProvider>
  );
};
