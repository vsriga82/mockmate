import { Request } from "express";

// In-memory storage for rate limiting (resets on server restart)
interface UsageStats {
  interviews: number;
  resumeChecks: number;
  lastReset: string; // Date string
}

const userUsage = new Map<string, UsageStats>();

// Get user identifier (IP address for now)
function getUserId(req: Request): string {
  return req.ip || req.connection.remoteAddress || 'unknown';
}

// Get today's date string for daily reset
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Initialize or get user stats for today
function getUserStats(userId: string): UsageStats {
  const today = getTodayString();
  const existing = userUsage.get(userId);
  
  if (!existing || existing.lastReset !== today) {
    const newStats: UsageStats = {
      interviews: 0,
      resumeChecks: 0,
      lastReset: today
    };
    userUsage.set(userId, newStats);
    return newStats;
  }
  
  return existing;
}

// Check if user can start a new interview
export function canStartInterview(req: Request): { allowed: boolean; message?: string } {
  const userId = getUserId(req);
  const stats = getUserStats(userId);
  
  if (stats.interviews >= 3) {
    return {
      allowed: false,
      message: "You've reached your daily limit of 3 practice interviews. Come back tomorrow for more practice!"
    };
  }
  
  return { allowed: true };
}

// Check if user can check resume
export function canCheckResume(req: Request): { allowed: boolean; message?: string } {
  const userId = getUserId(req);
  const stats = getUserStats(userId);
  
  if (stats.resumeChecks >= 2) {
    return {
      allowed: false,
      message: "Resume check limit reached for today. Upgrade to Pro for unlimited access."
    };
  }
  
  return { allowed: true };
}

// Record interview usage
export function recordInterviewUsage(req: Request): void {
  const userId = getUserId(req);
  const stats = getUserStats(userId);
  stats.interviews++;
  userUsage.set(userId, stats);
}

// Record resume check usage
export function recordResumeUsage(req: Request): void {
  const userId = getUserId(req);
  const stats = getUserStats(userId);
  stats.resumeChecks++;
  userUsage.set(userId, stats);
}

// Get current usage stats for display
export function getUserUsageStats(req: Request): UsageStats {
  const userId = getUserId(req);
  return getUserStats(userId);
}

// Clear all usage data (admin function)
export function resetAllUsage(): void {
  userUsage.clear();
}