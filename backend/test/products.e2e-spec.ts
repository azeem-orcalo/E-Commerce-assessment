import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('GET /api/products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with a paginated data array and meta object', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(res.body).toMatchObject({
      data: expect.any(Array),
      meta: {
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it('respects the limit query parameter — data.length does not exceed limit', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products?page=1&limit=3')
      .expect(200);

    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(3);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });

  it('returns 200 when filtering by search term', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/products?search=a')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('returns 200 when sorting by PRICE_ASC', async () => {
    await request(app.getHttpServer())
      .get('/api/products?sortBy=PRICE_ASC')
      .expect(200);
  });
});
