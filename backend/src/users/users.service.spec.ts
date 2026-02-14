import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockAccessToken'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mockSecret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should return tokens when credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('123456', 10),
        role: 'admin',
      };

      mockRepo.findOne.mockResolvedValue(user);

      const result = await service.login('admin', '123456');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.role).toBe('admin');
    });

    it('should throw UnauthorizedException if invalid', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
          service.login('wrong', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
