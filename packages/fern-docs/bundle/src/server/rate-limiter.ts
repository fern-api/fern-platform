export class RateLimiter {
  private count: number = 0;
  private lastReset: number = Date.now();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    if (now - this.lastReset >= this.windowMs) {
      this.count = 0;
      this.lastReset = now;
      return true;
    }
    return this.count < this.maxRequests;
  }

  increment(): void {
    this.count++;
  }
}

export class RateLimiterManager {
  private static instance: RateLimiterManager;
  private limiters: Map<string, RateLimiter> = new Map<string, RateLimiter>();

  private constructor() {}

  static getInstance(): RateLimiterManager {
    if (!RateLimiterManager.instance) {
      RateLimiterManager.instance = new RateLimiterManager();
    }
    return RateLimiterManager.instance;
  }

  getLimiter(
    context: string,
    maxRequests: number,
    windowMs: number
  ): RateLimiter {
    const existingLimiter = this.limiters.get(context);
    if (existingLimiter) {
      return existingLimiter;
    }
    const newLimiter = new RateLimiter(maxRequests, windowMs);
    this.limiters.set(context, newLimiter);
    return newLimiter;
  }
}
