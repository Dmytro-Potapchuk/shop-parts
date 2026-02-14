import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';

import { TestDatabaseModule } from './test-database.module';
import { UsersModule } from '../src/users/users.module';
import { PartsModule } from '../src/parts/parts.module';
import { AuthModule } from '../src/auth/auth.module';

describe('App E2E', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TestDatabaseModule,
        AuthModule,
        UsersModule,
        PartsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /*
   * ===============================
   * REGISTER
   * ===============================
   */
  it('POST /users/register', async () => {
    await request(app.getHttpServer())
      .post('/users/register')
      .send({
        username: 'e2euser',
        password: '123456',
        role: 'admin',
      })
      .expect(201);
  });

  /*
   * ===============================
   * LOGIN
   * ===============================
   */
  it('POST /users/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        username: 'e2euser',
        password: '123456',
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    accessToken = response.body.accessToken;
  });

  /*
   * ===============================
   * CREATE PART (AUTH)
   * ===============================
   */
  it('POST /parts (authorized)', async () => {
    await request(app.getHttpServer())
      .post('/parts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Brake Pad',
        description: 'Test part',
        price: 100,
        stock: 10,
      })
      .expect(201);
  });

  /*
   * ===============================
   * GET PARTS
   * ===============================
   */
  it('GET /parts', async () => {
    const response = await request(app.getHttpServer())
      .get('/parts')
      .expect(200);

    expect(response.body.items).toBeDefined();
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);

    expect(response.body.totalItems).toBeGreaterThan(0);
    expect(response.body.totalPages).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /parts (unauthorized)', async () => {
    await request(app.getHttpServer())
      .post('/parts')
      .send({
        name: 'Unauthorized',
        description: 'Should fail',
        price: 10,
        stock: 1,
      })
      .expect(401);
  });
});
