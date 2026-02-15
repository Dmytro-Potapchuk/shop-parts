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
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated result', async () => {
      const mockQB: any = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
      };

      repo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll({});

      expect(result.items.length).toBe(1);
      expect(result.totalItems).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply search', async () => {
      const mockQB: any = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      repo.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll({ search: 'test' });

      expect(mockQB.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return part', async () => {
      repo.findOne.mockResolvedValue({ id: 1 } as Part);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create part', async () => {
      repo.create.mockReturnValue({ name: 'test' } as Part);
      repo.save.mockResolvedValue({ id: 1 } as Part);

      const result = await service.create({
        name: 'test',
        description: 'd',
        price: 10,
        stock: 1,
      });

      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('should update part', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 1 } as Part);
      repo.update.mockResolvedValue({} as any);

      const result = await service.update(1, { name: 'new' });

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
          new NotFoundException(),
      );

      await expect(service.update(1, {})).rejects.toThrow(
          NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete part', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.delete(1)).rejects.toThrow(
          NotFoundException,
      );
    });
  });

  describe('purchase', () => {
    it('should reduce stock', async () => {
      const part = { id: 1, stock: 10 } as Part;

      jest.spyOn(service, 'findOne').mockResolvedValue(part);
      repo.save.mockResolvedValue({ ...part, stock: 5 } as Part);

      const result = await service.purchase(1, 5);

      expect(result.stock).toBe(5);
    });

    it('should throw BadRequestException if not enough stock', async () => {
      const part = { id: 1, stock: 2 } as Part;

      jest.spyOn(service, 'findOne').mockResolvedValue(part);

      await expect(service.purchase(1, 5)).rejects.toThrow(
          BadRequestException,
      );
    });
  });
});
