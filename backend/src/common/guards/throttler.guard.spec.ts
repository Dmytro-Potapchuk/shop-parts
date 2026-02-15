import { Reflector } from '@nestjs/core';
import { CustomThrottlerGuard } from './throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    const mockOptions: any = {
      throttlers: [
        {
          name: 'default',
          ttl: 10,
          limit: 5,
        },
      ],
    };

    const mockStorage: any = {}; // 👈 nie potrzebujemy metod

    const reflector = new Reflector();

    guard = new CustomThrottlerGuard(
        mockOptions,
        mockStorage,
        reflector,
    );
  });

  it('should return req.ip if exists', async () => {
    const result = await (guard as any).getTracker({
      ip: '127.0.0.1',
    });

    expect(result).toBe('127.0.0.1');
  });

  it('should return connection.remoteAddress if ip missing', async () => {
    const result = await (guard as any).getTracker({
      connection: { remoteAddress: '192.168.1.1' },
    });

    expect(result).toBe('192.168.1.1');
  });

  it('should return unknown if no ip', async () => {
    const result = await (guard as any).getTracker({});
    expect(result).toBe('unknown');
  });
});
