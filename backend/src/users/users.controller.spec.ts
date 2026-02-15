import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should call login service', async () => {
    mockService.login.mockResolvedValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      role: 'admin',
    });

    const result = await controller.login({
      username: 'admin',
      password: 'pass',
    });

    expect(result.accessToken).toBe('token');
  });
});
