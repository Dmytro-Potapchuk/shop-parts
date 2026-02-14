import { CustomThrottlerGuard } from './throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    guard = new CustomThrottlerGuard();
  });

  it('should return ip from request', async () => {
    const req = { ip: '127.0.0.1' };

    const result = await (guard as any).getTracker(req);

    expect(result).toBe('127.0.0.1');
  });

  it('should fallback to connection remoteAddress', async () => {
    const req = {
      connection: { remoteAddress: '192.168.0.1' },
    };

    const result = await (guard as any).getTracker(req);

    expect(result).toBe('192.168.0.1');
  });
});
