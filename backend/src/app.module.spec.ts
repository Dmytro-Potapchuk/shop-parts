import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test',
              JWT_EXPIRES_IN: '15m',
            }),
          ],
        }),
        AppModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
