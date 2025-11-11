// Provides NextAuth session context to the entire application.
// providers/auth-provider.tsx

'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
    children?: React.ReactNode;
};

// SessionProvider wrap all children, 
// allow all children to use useSession() to get current user session, include username, ...
export const AuthProvider = ({ children }: Props) => {
    return <SessionProvider>{children}</SessionProvider>;
};