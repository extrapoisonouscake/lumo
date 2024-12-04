class ClientQueueManager {
  private clientQueues: Map<string, PrioritizedRequestQueue> = new Map();

  /**
   * Gets or creates a queue for a specific client.
   * @param clientId - Unique identifier for the client.
   */
  getQueue(clientId: string): PrioritizedRequestQueue {
    if (!this.clientQueues.has(clientId)) {
      this.clientQueues.set(clientId, new PrioritizedRequestQueue());
    }
    return this.clientQueues.get(clientId)!;
  }

  /**
   * Cleans up a client queue after it's no longer needed.
   * @param clientId - The client identifier.
   */
  removeQueue(clientId: string): void {
    this.clientQueues.delete(clientId);
  }
}
type RequestFunction<T> = () => Promise<T>;

interface QueueItem<T> {
  requestFunction: RequestFunction<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  group?: string; // Optional group identifier
}

class PrioritizedRequestQueue {
  private queue: QueueItem<any>[] = [];
  private isProcessing: boolean = false;
  private currentGroup: string | null = null;

  /**
   * Enqueues a request, ensuring global serialization and group prioritization.
   */
  enqueue<T>(requestFunction: RequestFunction<T>, group?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFunction, resolve, reject, group });
      this.processQueue();
    });
  }

  /**
   * Processes the queue, respecting group prioritization.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const nextItem = this.getNextQueueItem();

    if (nextItem) {
      const { requestFunction, resolve, reject, group } = nextItem;
      this.currentGroup = group ?? null;
      try {
        const result = await requestFunction();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.isProcessing = false;
        this.currentGroup = null;
        this.processQueue(); // Continue processing the next item
      }
    }
  }

  /**
   * Retrieves the next queue item, respecting the current group's priority.
   */
  private getNextQueueItem(): QueueItem<any> | undefined {
    if (!this.currentGroup) {
      // If no group is active, pick the next available item
      return this.queue.shift();
    }
    // Continue processing the current group if there are pending requests
    const index = this.queue.findIndex(
      (item) => item.group === this.currentGroup
    );
    if (index !== -1) {
      return this.queue.splice(index, 1)[0];
    }
    // No more items in the current group, so reset the group and process the next item
    return this.queue.shift();
  }
}

export const clientQueueManager = new ClientQueueManager();
