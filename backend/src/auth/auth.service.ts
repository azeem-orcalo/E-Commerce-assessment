import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, AuthTokensResponse, SafeUser } from '../common/types';

const BCRYPT_ROUNDS = 10;

/** Converts env expiry strings like '15m', '7d', '3600' to seconds (number).
 *  Returns the defaultSeconds if the env var is missing or unparseable.
 *  Using seconds avoids the StringValue branded-type issue in @nestjs/jwt@11. */
function parseExpiryToSeconds(env: string | undefined, defaultSeconds: number): number {
  if (!env) return defaultSeconds;
  if (/^\d+$/.test(env)) return parseInt(env, 10);
  const match = env.match(/^(\d+)([smhd])$/);
  if (!match) return defaultSeconds;
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] ?? 1);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse & { refreshToken: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        city: dto.city,
        address: dto.address,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.buildTokenResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse & { refreshToken: string }> {
    // Fetch full user (including passwordHash) for credential verification only
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid email or password');

    // Strip passwordHash before passing to buildTokenResponse
    const { passwordHash: _ph, ...safeUser } = user;
    return this.buildTokenResponse(safeUser);
  }

  async refreshTokens(
    payload: JwtPayload,
  ): Promise<AuthTokensResponse & { refreshToken: string }> {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return this.buildTokenResponse(user);
  }

  private buildTokenResponse(user: SafeUser): AuthTokensResponse & { refreshToken: string } {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: process.env['JWT_SECRET'],
      expiresIn: parseExpiryToSeconds(process.env['JWT_ACCESS_EXPIRY'], 900),
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: process.env['JWT_REFRESH_SECRET'],
      expiresIn: parseExpiryToSeconds(process.env['JWT_REFRESH_EXPIRY'], 604800),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
}
