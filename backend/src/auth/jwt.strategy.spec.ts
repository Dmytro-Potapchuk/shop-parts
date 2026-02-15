import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  it('should validate payload', async () => {
    const config = {
      get: jest.fn().mockReturnValue('secret'),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(config);

    const payload = { sub: 1, role: 'admin' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ id: 1, role: 'admin' });
  });

  it('should throw if no secret', () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(config)).toThrow();
  });
});
