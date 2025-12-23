import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback for development without Upstash
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

function createInMemoryRateLimiter(requests: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const now = Date.now()
      const record = inMemoryStore.get(identifier)

      if (!record || now > record.resetTime) {
        inMemoryStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return { success: true, remaining: requests - 1 }
      }

      if (record.count >= requests) {
        return { success: false, remaining: 0 }
      }

      record.count++
      return { success: true, remaining: requests - record.count }
    },
  }
}

// Create rate limiters
let authRateLimiter: ReturnType<typeof createInMemoryRateLimiter> | Ratelimit
let apiRateLimiter: ReturnType<typeof createInMemoryRateLimiter> | Ratelimit

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  // Auth endpoints: 5 requests per 15 minutes
  authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  })

  // General API: 100 requests per 15 minutes
  apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  })
} else {
  // Fallback to in-memory rate limiting for development
  authRateLimiter = createInMemoryRateLimiter(5, 15 * 60 * 1000)
  apiRateLimiter = createInMemoryRateLimiter(100, 15 * 60 * 1000)
}

export async function checkAuthRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const result = await authRateLimiter.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}

export async function checkApiRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const result = await apiRateLimiter.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}
