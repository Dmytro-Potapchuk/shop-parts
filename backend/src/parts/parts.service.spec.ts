import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { PartsService } from './parts.service';
import { Part } from './parts.entity';

describe('PartsService', () => {
  let service: PartsService;
  let repo: jest.Mocked<Repository<Part>>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartsService,
        {
          provide: getRepositoryToken(Part),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PartsService>(PartsService);
    repo = module.get(getRepositoryToken(Part));
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a part', async () => {
    const dto = { name: 'Test', price: 10, stock: 5 };
    const saved = { id: 1, ...dto };

    repo.create.mockReturnValue(saved as Part);
    repo.save.mockResolvedValue(saved as Part);

    const result = await service.create(dto as any);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual(saved);
  });

  it('should find one part', async () => {
    const part = { id: 1, name: 'Test' };

    repo.findOne.mockResolvedValue(part as Part);

    const result = await service.findOne(1);
    expect(result).toEqual(part);
  });

  it('should throw NotFound if part not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should delete part', async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);

    await service.delete(1);

    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if delete fails', async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.delete(1)).rejects.toThrow(NotFoundException);
  });

  it('should purchase part', async () => {
    const part = { id: 1, stock: 10 };

    repo.findOne.mockResolvedValue(part as Part);
    repo.save.mockImplementation(async (p) => p);

    const result = await service.purchase(1, 2);

    expect(result.stock).toBe(8);
  });

  it('should throw if not enough stock', async () => {
    const part = { id: 1, stock: 1 };

    repo.findOne.mockResolvedValue(part as Part);

    await expect(service.purchase(1, 5)).rejects.toThrow(BadRequestException);
  });
});
