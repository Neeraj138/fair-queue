import { describe, it, expect, beforeEach } from 'bun:test';
import { RoundRobinScheduler } from '../../src/core/scheduler';

describe('Round Robin Scheduler', () => {
  let scheduler: RoundRobinScheduler;
  beforeEach(() => {
    scheduler = new RoundRobinScheduler();
  });

  it('returns true when enqueueing a new client', () => {
    const result = scheduler.enqueueClient('a');
    expect(result).toBe(true);
  });

  it('returns false when enqueueing an existing client', () => {
    scheduler.enqueueClient('a');
    const result = scheduler.enqueueClient('a');
    expect(result).toBe(false);
  });

  it('dequeues clients in FIFO order', () => {
    scheduler.enqueueClient('a');
    scheduler.enqueueClient('b');
    scheduler.enqueueClient('c');

    let result = scheduler.dequeueClient();
    expect(result).toBe('a');
    result = scheduler.dequeueClient();
    expect(result).toBe('b');
    result = scheduler.dequeueClient();
    expect(result).toBe('c');
  });

  it('removes client after dequeue', () => {
    scheduler.enqueueClient('a');
    scheduler.dequeueClient();

    const result = scheduler.hasClient('a');
    expect(result).toBe(false);
  });

  it('dequeue returns null when scheduler is empty', () => {
    const result = scheduler.dequeueClient();
    expect(result).toBeNull();
  });
});
