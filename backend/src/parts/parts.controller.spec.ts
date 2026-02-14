import { Test, TestingModule } from '@nestjs/testing';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';

describe('PartsController', () => {
  let controller: PartsController;
  let service: jest.Mocked<PartsService>;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    purchase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartsController],
      providers: [
        {
          provide: PartsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PartsController>(PartsController);
    service = module.get(PartsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return all parts', async () => {
    const result = { items: [], totalItems: 0 };
    service.findAll.mockResolvedValue(result as any);

    expect(await controller.findAll({} as any)).toEqual(result);
  });

  it('should return one part', async () => {
    const part = { id: 1 };
    service.findOne.mockResolvedValue(part as any);

    expect(await controller.findOne(1)).toEqual(part);
  });

  it('should create part', async () => {
    const part = { id: 1 };
    service.create.mockResolvedValue(part as any);

    expect(await controller.create({} as any)).toEqual(part);
  });

  it('should update part', async () => {
    const part = { id: 1 };
    service.update.mockResolvedValue(part as any);

    expect(await controller.update(1, {} as any)).toEqual(part);
  });

  it('should delete part', async () => {
    service.delete.mockResolvedValue(undefined);

    await controller.delete(1);
    expect(service.delete).toHaveBeenCalledWith(1);
  });
});
