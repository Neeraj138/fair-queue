import { describe, it, expect, beforeEach } from 'bun:test';
import { MemoryBroker } from '../../src/brokers/memory/memory.broker';
import { Queue } from '../../src/core/queue';

describe('Fair Queue', () => {
  let queue: Queue;
  let queueName = 'jobs';
  beforeEach(() => {
    const broker = new MemoryBroker();
    queue = new Queue(broker);
  });

  it('publish then dequeue return same message', async () => {
    const msgPayload = {
      name: 'a1',
    };
    await queue.publish(queueName, {
      clientId: 'a',
      payload: msgPayload,
    });

    const result = await queue.dequeue(queueName);

    expect(result?.clientId).toBe('a');
    expect(result?.payload).toBe(msgPayload);
  });

  it('returns null when empty queue is dequeued', async () => {
    const result = await queue.dequeue<{ name: string }>(queueName);
    expect(result).toBeNull();
  });

  it('dequeues messages of same client in FIFO order', async () => {
    await queue.publish(queueName, {
      clientId: 'a',
      payload: 'a1',
    });
    await queue.publish(queueName, {
      clientId: 'a',
      payload: 'a2',
    });

    let result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('a');
    expect(result?.payload).toBe('a1');
    result = await queue.dequeue(queueName);
    expect(result?.payload).toBe('a2');
    result = await queue.dequeue(queueName);
    expect(result).toBeNull();
  });

  it('dequeues fairly', async () => {
    await queue.publish(queueName, {
      clientId: 'a',
      payload: 'a1',
    });
    await queue.publish(queueName, {
      clientId: 'a',
      payload: 'a2',
    });
    await queue.publish(queueName, {
      clientId: 'a',
      payload: 'a3',
    });
    await queue.publish(queueName, {
      clientId: 'b',
      payload: 'b1',
    });
    await queue.publish(queueName, {
      clientId: 'b',
      payload: 'b2',
    });
    await queue.publish(queueName, {
      clientId: 'c',
      payload: 'c1',
    });
    let result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('a');
    expect(result?.payload).toBe('a1');
    result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('b');
    expect(result?.payload).toBe('b1');
    result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('c');
    expect(result?.payload).toBe('c1');
    result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('a');
    expect(result?.payload).toBe('a2');
    result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('b');
    expect(result?.payload).toBe('b2');
    result = await queue.dequeue(queueName);
    expect(result?.clientId).toBe('a');
    expect(result?.payload).toBe('a3');
  });
});
