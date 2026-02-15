import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello NestJS!'),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AppController);
    appService = moduleRef.get(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return value from AppService', () => {
    const result = controller.getHello();
    expect(result).toBe('Hello NestJS!');
    expect(appService.getHello).toHaveBeenCalled();
  });
});
