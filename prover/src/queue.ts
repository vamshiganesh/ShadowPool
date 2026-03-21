import type { QueueMessage } from "./types";

/**
 * Simple in-memory queue for v1 prover ↔ watcher communication.
 * Replace with Redis pub/sub or NATS in v2.
 */
type Handler = (msg: QueueMessage) => void;

const handlers: Handler[] = [];
const queue: QueueMessage[] = [];

export function publish(msg: QueueMessage): void {
  queue.push(msg);
  for (const handler of handlers) {
    handler(msg);
  }
}

export function subscribe(handler: Handler): void {
  handlers.push(handler);
}

export function drain(): QueueMessage[] {
  const pending = [...queue];
  queue.length = 0;
  return pending;
}

export function pendingCount(): number {
  return queue.length;
}
