// Configures NextAuth.js and handles all authentication-related API requests (login, logout, callback, session)
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserStatus } from '@prisma/client';
import { authRateLimiter } from '@/lib/rate-limit';

export const authOptions: AuthOptions = {
    providers: [
        // only use email and password, no need of OAuth
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },


            async authorize(credentials, req) {
                // Rate limiting for login attempts
                if (req?.headers) {
                    // req.headers is a Headers object, so we need to extract the IP differently
                    const forwardedFor = req.headers['x-forwarded-for'];
                    const realIp = req.headers['x-real-ip'];
                    const identifier = (forwardedFor?.split(',')[0]?.trim()) || realIp || 'unknown';

                    const rateLimit = await authRateLimiter.check(identifier);
                    if (!rateLimit.success) {
                        throw new Error(`Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${Math.ceil((rateLimit.reset - Date.now()) / 1000 / 60)} phút.`);
                    }
                }

                // Check whether type email and pw
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Vui lòng nhập email và mật khẩu');
                }

                // find user in db
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.passwordHash) {
                    throw new Error('Người dùng không tồn tại');
                }

                // check status
                if (user.status === 'LOCKED') {
                    throw new Error('Tài khoản này đã bị khóa.');
                }

                // check pw
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordCorrect) {
                    throw new Error('Mật khẩu không chính xác');
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { passwordHash, ...userWithoutPassword } = user;
                return userWithoutPassword;
            },
        }),
    ],

    // view types/next-auth.d.ts
    // This callback is called whenever a JWT is created (i.e., at sign-in).
    // We are adding the user ID from the database to the token here.
    callbacks: {
        // called when a JWT is created
        jwt({ token, user }) {
            if (user) {
                token.id = user.id; // add user's ID into token
                token.role = user.role;
                token.status = user.status;
            }
            return token;
        },
        // called when a token is accessed
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;

                // take status from db each time session is called
                const userFromDb = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { status: true },
                });
                session.user.status = userFromDb?.status || UserStatus.LOCKED;
            }
            return session;
        },
    },

    session: {
        strategy: 'jwt', // use jwt to mange session
    },
    secret: process.env.NEXTAUTH_SECRET, // JWT secret key
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };