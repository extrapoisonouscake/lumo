type RequestFunction<T> = () => Promise<T>;

interface QueueItem<T> {
  requestFunction: RequestFunction<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  isSecondary?: boolean;
}

export class PrioritizedRequestQueue {
  private queue: QueueItem<any>[] = [];
  private isProcessing: boolean = false;

  private secondaryDelayMs: number = 100;
  enqueue<T>(
    requestFunction: RequestFunction<T>,
    isSecondary?: boolean
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        requestFunction,
        resolve,
        reject,
        isSecondary,
      };

      this.queue.push(queueItem);

      const hasEssentialRequests = this.queue.some((item) => !item.isSecondary);
      // If this is a secondary request and we have essential requests, add a delay
      if (isSecondary) {
        if (hasEssentialRequests) {
          return;
        } else {
          setTimeout(() => {
            this.processQueue();
          }, this.secondaryDelayMs);
        }
      } else {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    let nextItem;
    const nextItemIndex = this.queue.findIndex((item) => !item.isSecondary);
    if (nextItemIndex !== -1) {
      nextItem = this.queue.splice(nextItemIndex, 1)[0];
    } else {
      nextItem = this.queue.shift();
    }
    if (!nextItem) return;
    const { requestFunction, resolve, reject, isSecondary } = nextItem;
    this.isProcessing = true;
    try {
      const result = await requestFunction();
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    } finally {
      this.isProcessing = false;

      this.processQueue(); // Continue processing the next item
    }
  }
}
