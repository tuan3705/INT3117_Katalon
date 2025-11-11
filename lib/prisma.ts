// Initializes a singleton Prisma Client instance to prevent multiple database connections.
// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// global instance
declare global {
    var prisma: PrismaClient | undefined;
}

// prevent Next.js hot-reload
const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;


export default client;