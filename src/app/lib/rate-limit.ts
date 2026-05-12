import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}

const PDF_LIMIT = 3;
const AI_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 2;

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function checkPdfRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const today = getTodayKey();

  const pdfKey = `rate:pdf:${ip}:${today}`;
  const freqKey = `rate:freq:${ip}`;

  try {
    const [pdfCount, freqCount] = await Promise.all([
      redis.get<number>(pdfKey),
      redis.get<number>(freqKey),
    ]);

    const currentPdfCount = pdfCount || 0;
    const currentFreqCount = freqCount || 0;

    if (currentPdfCount >= PDF_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getTomorrowTimestamp(),
        error: `今日上传次数已用完（${PDF_LIMIT}次/天）`,
      };
    }

    if (currentFreqCount >= RATE_LIMIT_MAX) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getNextMinuteTimestamp(),
        error: "请求过于频繁，请稍后再试",
      };
    }

    return {
      allowed: true,
      remaining: PDF_LIMIT - currentPdfCount,
      resetAt: getTomorrowTimestamp(),
    };
  } catch (error) {
    console.error("Redis error in checkPdfRateLimit:", error);
    return {
      allowed: true,
      remaining: PDF_LIMIT,
      resetAt: getTomorrowTimestamp(),
      error: "Redis unavailable, allowing request",
    };
  }
}

export async function checkAiRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const today = getTodayKey();

  const aiKey = `rate:ai:${ip}:${today}`;
  const freqKey = `rate:freq:${ip}`;

  try {
    const [aiCount, freqCount] = await Promise.all([
      redis.get<number>(aiKey),
      redis.get<number>(freqKey),
    ]);

    const currentAiCount = aiCount || 0;
    const currentFreqCount = freqCount || 0;

    if (currentAiCount >= AI_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getTomorrowTimestamp(),
        error: `今日AI功能次数已用完（${AI_LIMIT}次/天）`,
      };
    }

    if (currentFreqCount >= RATE_LIMIT_MAX) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: getNextMinuteTimestamp(),
        error: "请求过于频繁，请稍后再试",
      };
    }

    return {
      allowed: true,
      remaining: AI_LIMIT - currentAiCount,
      resetAt: getTomorrowTimestamp(),
    };
  } catch (error) {
    console.error("Redis error in checkAiRateLimit:", error);
    return {
      allowed: true,
      remaining: AI_LIMIT,
      resetAt: getTomorrowTimestamp(),
      error: "Redis unavailable, allowing request",
    };
  }
}

export async function incrementPdfUsage(request: Request): Promise<void> {
  const ip = getClientIP(request);
  const today = getTodayKey();
  const pdfKey = `rate:pdf:${ip}:${today}`;
  const freqKey = `rate:freq:${ip}`;

  try {
    await Promise.all([
      redis.incr(pdfKey),
      redis.expire(pdfKey, 86400),
      redis.incr(freqKey),
      redis.expire(freqKey, RATE_LIMIT_WINDOW),
    ]);
  } catch (error) {
    console.error("Redis error in incrementPdfUsage:", error);
  }
}

export async function incrementAiUsage(request: Request): Promise<void> {
  const ip = getClientIP(request);
  const today = getTodayKey();
  const aiKey = `rate:ai:${ip}:${today}`;
  const freqKey = `rate:freq:${ip}`;

  try {
    await Promise.all([
      redis.incr(aiKey),
      redis.expire(aiKey, 86400),
      redis.incr(freqKey),
      redis.expire(freqKey, RATE_LIMIT_WINDOW),
    ]);
  } catch (error) {
    console.error("Redis error in incrementAiUsage:", error);
  }
}

function getTomorrowTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function getNextMinuteTimestamp(): number {
  const next = new Date();
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() + 1);
  return next.getTime();
}

export function createRateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    {
      success: false,
      error: result.error || "请求被限制",
      remaining: result.remaining,
      resetAt: result.resetAt,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.resetAt.toString(),
        "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
      },
    }
  );
}