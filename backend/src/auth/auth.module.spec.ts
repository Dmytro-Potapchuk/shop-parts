import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule', () => {
  it('should compile the module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'testsecret',
              JWT_EXPIRES_IN: '15m',
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });

  it('should provide JwtStrategy', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'testsecret',
              JWT_EXPIRES_IN: '15m',
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();

    const strategy = moduleRef.get(JwtStrategy);
    expect(strategy).toBeDefined();
  });

  it('should export JwtModule', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'testsecret',
              JWT_EXPIRES_IN: '15m',
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();

    const jwt = moduleRef.get(JwtModule);
    expect(jwt).toBeDefined();
  });
});
