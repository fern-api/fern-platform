export class Semaphore {
  public count: number;
  public readonly waiting: (() => void)[] = [];

  constructor(count: number) {
    this.count = count;
  }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
    } else {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
  }

  release(): void {
    this.count++;
    const next = this.waiting.shift();
    if (next) {
      next();
    }
  }

  async use<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  isLocked(): boolean {
    return this.count <= 0;
  }
}
