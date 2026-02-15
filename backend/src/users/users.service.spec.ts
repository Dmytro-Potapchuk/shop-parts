import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const values = {
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_SECRET: 'refresh',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user', async () => {
      repo.create.mockReturnValue({ username: 'test' } as User);
      repo.save.mockResolvedValue({ id: 1 } as User);

      const result = await service.register('test', '123', 'client');

      expect(result.id).toBe(1);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const hashed = await bcrypt.hash('123', 10);

      repo.findOne.mockResolvedValue({
        id: 1,
        password: hashed,
        role: 'admin',
      } as User);

      mockJwt.sign.mockReturnValue('token');

      const result = await service.login('test', '123');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.login('test', '123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      const refreshToken = 'refreshToken';
      const hashed = await bcrypt.hash(refreshToken, 10);

      mockJwt.verify.mockReturnValue({ sub: 1 });

      repo.findOne.mockResolvedValue({
        id: 1,
        role: 'admin',
        refreshToken: hashed,
      } as User);

      mockJwt.sign.mockReturnValue('newAccess');

      const result = await service.refresh(refreshToken);

      expect(result.accessToken).toBe('newAccess');
    });

    it('should throw UnauthorizedException if invalid', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refresh('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refreshToken', async () => {
      await service.logout(1);
      expect(repo.update).toHaveBeenCalledWith(1, {
        refreshToken: null,
      });
    });
  });
});
