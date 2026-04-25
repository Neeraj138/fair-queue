export interface Message<T> {
  id: string;
  clientId: string;
  payload: T;
  enqueuedAt: number;
}

export interface QueueConfig {
  pollingIntervalMs?: number;
}

export type DequeueResult<T> = Message<T> | null;
