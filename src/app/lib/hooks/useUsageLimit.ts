import { generateDeviceFingerprint } from "./useDeviceFingerprint";

export interface UsageLimits {
  pdfCount: number;
  aiCount: number;
  lastResetDate: string;
}

const STORAGE_KEY = "resume_usage";
const PDF_LIMIT = 30;
const AI_LIMIT = 30;

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getInitialUsage(): UsageLimits {
  return {
    pdfCount: 0,
    aiCount: 0,
    lastResetDate: getToday(),
  };
}

function getStoredUsage(): UsageLimits {
  if (typeof window === "undefined") {
    return getInitialUsage();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getInitialUsage();
    }

    const usage: UsageLimits = JSON.parse(stored);
    const today = getToday();

    if (usage.lastResetDate !== today) {
      const resetUsage: UsageLimits = {
        ...getInitialUsage(),
        lastResetDate: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetUsage));
      return resetUsage;
    }

    return usage;
  } catch {
    return getInitialUsage();
  }
}

function saveUsage(usage: UsageLimits): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    console.error("Failed to save usage to localStorage");
  }
}

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const stored = localStorage.getItem("device_fingerprint");
  if (stored) {
    return stored;
  }

  const fingerprint = generateDeviceFingerprint();
  localStorage.setItem("device_fingerprint", fingerprint);
  return fingerprint;
}

export interface CheckPdfResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export interface CheckAiResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export function checkPdfLimit(): CheckPdfResult {
  const usage = getStoredUsage();
  const remaining = PDF_LIMIT - usage.pdfCount;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `今日上传次数已用完（${PDF_LIMIT}次/天）`,
    };
  }

  return { allowed: true, remaining };
}

export function checkAiLimit(): CheckAiResult {
  const usage = getStoredUsage();
  const remaining = AI_LIMIT - usage.aiCount;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `今日AI功能次数已用完（${AI_LIMIT}次/天）`,
    };
  }

  return { allowed: true, remaining };
}

export function incrementPdfUsage(): void {
  const usage = getStoredUsage();
  usage.pdfCount += 1;
  saveUsage(usage);
}

export function incrementAiUsage(): void {
  const usage = getStoredUsage();
  usage.aiCount += 1;
  saveUsage(usage);
}

export function getUsageInfo(): { pdf: CheckPdfResult; ai: CheckAiResult } {
  return {
    pdf: checkPdfLimit(),
    ai: checkAiLimit(),
  };
}

export const PDF_LIMIT_COUNT = PDF_LIMIT;
export const AI_LIMIT_COUNT = AI_LIMIT;