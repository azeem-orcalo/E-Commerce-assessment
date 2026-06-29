import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = { email: 'new@example.com', password: 'Password123!', name: 'New User' };

    beforeEach(() => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(makeUser({ email: dto.email, name: dto.name }));
    });

    it('stores a bcrypt hash — not the plain-text password', async () => {
      await service.register(dto);

      const createCall = mockPrisma.user.create.mock.calls[0][0] as {
        data: { passwordHash: string };
      };
      const stored = createCall.data.passwordHash;

      expect(stored).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, stored)).toBe(true);
    });

    it('never returns passwordHash in the response', async () => {
      const result = await service.register(dto);
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('returns accessToken and sets refreshToken', async () => {
      const result = await service.register(dto);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.jwt.token');
    });

    it('returns user object with id, email, name, role, createdAt', async () => {
      const result = await service.register(dto);
      expect(result.user).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
        role: expect.any(String),
        createdAt: expect.any(Date),
      });
    });

    it('throws ConflictException when email is already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser());
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      await expect(service.register(dto)).rejects.toThrow('Email is already registered');
    });

    it('does NOT create a user when email is taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser());
      await expect(service.register(dto)).rejects.toThrow();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const rawPassword = 'Password123!';
    let hash: string;

    beforeEach(async () => {
      hash = await bcrypt.hash(rawPassword, 10);
    });

    it('returns tokens on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));
      const result = await service.login({ email: 'test@example.com', password: rawPassword });
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).toMatchObject({ id: 'user-uuid-1', email: 'test@example.com' });
    });

    it('never returns passwordHash in login response', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));
      const result = await service.login({ email: 'test@example.com', password: rawPassword });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException for wrong password (same message as unknown email)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));
      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword!' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws UnauthorizedException for unknown email (same message as wrong password)', async () => {
      // Prevents user enumeration — both cases use identical error message
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'ghost@example.com', password: 'anything' }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({ email: 'ghost@example.com', password: 'anything' }),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  // ── refreshTokens ──────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    const payload = { sub: 'user-uuid-1', email: 'test@example.com', role: 'CUSTOMER' as const };

    it('returns new tokens for a valid payload', async () => {
      mockUsersService.findById.mockResolvedValue(makeUser());
      const result = await service.refreshTokens(payload);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBe('mock.jwt.token');
    });

    it('throws UnauthorizedException if user no longer exists in DB', async () => {
      mockUsersService.findById.mockResolvedValue(null);
      await expect(service.refreshTokens(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(payload)).rejects.toThrow('User no longer exists');
    });
  });
});
