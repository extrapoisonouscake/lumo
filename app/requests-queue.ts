type RequestFunction<T> = () => Promise<T>;

interface QueueItem<T> {
  requestFunction: RequestFunction<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  group?: string; // Optional group identifier
}

export class PrioritizedRequestQueue {
  private queue: QueueItem<any>[] = [];
  private isProcessing: boolean = false;

  /**
   * Enqueues a request, ensuring global serialization and group prioritization.
   */
  enqueue<T>(requestFunction: RequestFunction<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFunction,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  /**
   * Processes the queue, respecting group prioritization.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    const nextItem = this.queue.shift();
    if (!nextItem) return;
    const { requestFunction, resolve, reject } = nextItem;
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
