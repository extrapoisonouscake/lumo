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
  isLastRequest?: boolean;
}

class PrioritizedRequestQueue {
  private queue: QueueItem<any>[] = [];
  private isProcessing: boolean = false;
  private currentGroup: string | null = null;

  /**
   * Enqueues a request, ensuring global serialization and group prioritization.
   */
  enqueue<T>(
    requestFunction: RequestFunction<T>,
    group?: string,
    isLastRequest?: QueueItem<T>["isLastRequest"]
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFunction,
        resolve,
        reject,
        group,
        isLastRequest,
      });
      this.processQueue();
    });
  }

  /**
   * Processes the queue, respecting group prioritization.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0){ console.log("queue is empty or processing"); return; }
    console.log("processing queue")
    const nextItem = this.getNextQueueItem();
    console.log({nextItem})
    if (nextItem) {
      const { requestFunction, resolve, reject, group } = nextItem;
      this.isProcessing = true;
      this.currentGroup = group ?? null;
      try {
        const result = await requestFunction();
        console.log({result})
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.isProcessing = false;
        console.log("finished processing queue",nextItem.group)
        console.log({currentGroup:this.currentGroup})
        if (this.currentGroup && nextItem.isLastRequest) {
          this.currentGroup = null;
        }
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
  }
}

export const clientQueueManager = new ClientQueueManager();
