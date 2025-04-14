import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';
import { PrismaService } from '../src/prisma/prisma.service';
dotenv.config({ path: '.env.test' });

describe('AppController (e2e)', () => {

  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/register (POST) - should register user', async () => {
    const email = `e2e-${Date.now()}@test.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: email, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', email);
  });

  it('/auth/login (POST) - should login and return JWT', async () => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  it('/auth/me (GET) - should return user info', async () => {
    const uniqueEmail = `e2e-${Date.now()}@test.com`;
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: uniqueEmail, password })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: uniqueEmail, password });

    const token = loginRes.body.access_token;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', uniqueEmail);
  });

});
