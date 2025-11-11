// Declaration Typescript
// By default, we have:
// interface Session {
//   user: {
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//   }
// }

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    /**
     * Expand the interface to add id into user
     */
    interface Session {
        user: {
            id: string;
            role: Role;
            status: UserStatus;
        } & DefaultSession['user'];
    }

    /**
     * Expand default interface User 
     * This one is different with module User in schema.prisma
     * Like a short version used by next-auth
     */
    interface User {
        id: string;
        role: Role;
        status: UserStatus;
    }
}

declare module 'next-auth/jwt' {
    /**
     * Expand the interface JWT to add attribute `id`
     */
    interface JWT {
        id: string;
        role: Role;
    }
}