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

  private secondaryDelayMs: number = 200;
  private setSecondaryDelay() {
    setTimeout(() => {
      this.processQueue({ processSecondary: true });
    }, this.secondaryDelayMs);
  }
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

      // If this is a secondary request and we have essential requests, add a delay
      if (isSecondary) {
        const hasEssentialRequests = this.queue.some(
          (item) => !item.isSecondary
        );
        if (hasEssentialRequests) {
          return;
        } else {
          this.setSecondaryDelay();
        }
      } else {
        this.processQueue({ processSecondary: false });
      }
    });
  }

  private async processQueue({
    processSecondary = false,
  }: {
    processSecondary: boolean;
  }): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }
    if (this.isProcessing) {
      if (processSecondary) {
        this.setSecondaryDelay();
      }
      return;
    }
    let nextItem;
    const nextEssentialItemIndex = this.queue.findIndex(
      (item) => !item.isSecondary
    );
    if (nextEssentialItemIndex !== -1) {
      nextItem = this.queue.splice(nextEssentialItemIndex, 1)[0];
    } else {
      if (!processSecondary) {
        this.setSecondaryDelay();
        return;
      }
      nextItem = this.queue.shift();
    }

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
      this.processQueue({ processSecondary: false }); // Continue processing the next item
    }
  }
}
