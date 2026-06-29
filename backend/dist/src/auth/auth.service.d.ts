import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, AuthTokensResponse } from '../common/types';
export declare class AuthService {
    private readonly prisma;
    private readonly users;
    private readonly jwtService;
    constructor(prisma: PrismaService, users: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<AuthTokensResponse & {
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<AuthTokensResponse & {
        refreshToken: string;
    }>;
    refreshTokens(payload: JwtPayload): Promise<AuthTokensResponse & {
        refreshToken: string;
    }>;
    private buildTokenResponse;
}
