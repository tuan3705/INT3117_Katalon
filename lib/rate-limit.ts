// Rate limiting utility using in-memory store
// lib/rate-limit.ts

import { NextResponse } from 'next/server';

interface RateLimitConfig {
    interval: number; // Time window in milliseconds
    uniqueTokenPerInterval: number; // Max requests per interval
}

interface TokenBucket {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, TokenBucket>();

export class RateLimiter {
    private interval: number;
    private uniqueTokenPerInterval: number;

    constructor(config: RateLimitConfig) {
        this.interval = config.interval;
        this.uniqueTokenPerInterval = config.uniqueTokenPerInterval;
    }

    /**
     * Check if request should be rate limited
     * @param identifier - Unique identifier for the client (IP, user ID, etc.)
     * @returns true if rate limit exceeded, false otherwise
     */
    async check(identifier: string): Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
    }> {
        const now = Date.now();
        const bucket = rateLimitStore.get(identifier);

        // If no bucket exists or reset time has passed, create new bucket
        if (!bucket || now > bucket.resetTime) {
            const newBucket: TokenBucket = {
                count: 1,
                resetTime: now + this.interval,
            };
            rateLimitStore.set(identifier, newBucket);

            return {
                success: true,
                limit: this.uniqueTokenPerInterval,
                remaining: this.uniqueTokenPerInterval - 1,
                reset: newBucket.resetTime,
            };
        }

        // Increment count
        bucket.count++;

        // Check if limit exceeded
        if (bucket.count > this.uniqueTokenPerInterval) {
            return {
                success: false,
                limit: this.uniqueTokenPerInterval,
                remaining: 0,
                reset: bucket.resetTime,
            };
        }

        return {
            success: true,
            limit: this.uniqueTokenPerInterval,
            remaining: this.uniqueTokenPerInterval - bucket.count,
            reset: bucket.resetTime,
        };
    }
}

// Cleanup old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitStore.entries()) {
        if (now > bucket.resetTime + 3600000) { // 1 hour buffer
            rateLimitStore.delete(key);
        }
    }
}, 3600000); // Run every hour

/**
 * Get client identifier from request (IP address)
 */
export function getIdentifier(request: Request): string {
    // Try to get real IP from headers (works with proxies/load balancers)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback (less reliable)
    return 'unknown';
}

/**
 * Helper function to apply rate limiting to an API route
 */
export async function withRateLimit(
    request: Request,
    rateLimiter: RateLimiter,
    identifier?: string
): Promise<NextResponse | null> {
    const clientId = identifier || getIdentifier(request);
    const result = await rateLimiter.check(clientId);

    if (!result.success) {
        return NextResponse.json(
            {
                error: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': result.limit.toString(),
                    'X-RateLimit-Remaining': result.remaining.toString(),
                    'X-RateLimit-Reset': result.reset.toString(),
                    'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
                }
            }
        );
    }

    // Add rate limit headers to response
    return null; // No rate limit error, proceed with request
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 1000, // 1000 attempts per 15 minutes
});

export const apiRateLimiter = new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 requests per minute
});

export const strictRateLimiter = new RateLimiter({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 3, // 3 attempts per hour (for password reset)
});