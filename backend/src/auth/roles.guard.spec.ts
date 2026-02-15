import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './roles.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user?: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);
  });

  it('should allow access if no roles required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const context = mockExecutionContext({ role: Role.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw if user missing', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const context = mockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Brak użytkownika'),
    );
  });

  it('should throw if role not allowed', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const context = mockExecutionContext({ role: Role.CLIENT });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Brak odpowiednich uprawnień'),
    );
  });

  it('should allow if role matches', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const context = mockExecutionContext({ role: Role.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });
});
