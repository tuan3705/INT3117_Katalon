// A client component that periodically checks the session and logs out locked users.
// components/shared/session-manager.tsx

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export const SessionManager = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.status === 'LOCKED') {
            signOut({ callbackUrl: '/login?error=account_locked' });
        }
    }, [session, status]); // Run again each time session or status change

    return null;
};