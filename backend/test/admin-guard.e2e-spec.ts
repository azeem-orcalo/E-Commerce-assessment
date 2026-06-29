import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Registers a fresh customer and returns their access token so this test
// is self-contained and does not depend on the seed database.
async function registerCustomer(app: INestApplication): Promise<string> {
  const uniqueEmail = `guard-test-${Date.now()}@example.com`;
  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      firstName: 'Guard',
      lastName: 'Tester',
      email: uniqueEmail,
      phone: '+447700900099',
      city: 'London',
      address: '1 Test Street',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
    });
  return res.body.accessToken as string;
}

describe('Admin guard (e2e)', () => {
  let app: INestApplication<App>;
  let customerToken: string;

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

    customerToken = await registerCustomer(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when no JWT is provided on an admin endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/orders')
      .expect(401);
  });

  it('returns 403 when a customer JWT is used on an admin endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});
