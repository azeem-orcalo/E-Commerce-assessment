"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const BCRYPT_ROUNDS = 10;
function parseExpiryToSeconds(env, defaultSeconds) {
    if (!env)
        return defaultSeconds;
    if (/^\d+$/.test(env))
        return parseInt(env, 10);
    const match = env.match(/^(\d+)([smhd])$/);
    if (!match)
        return defaultSeconds;
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return amount * (multipliers[unit] ?? 1);
}
let AuthService = class AuthService {
    prisma;
    users;
    jwtService;
    constructor(prisma, users, jwtService) {
        this.prisma = prisma;
        this.users = users;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.users.findByEmail(dto.email);
        if (existing)
            throw new common_1.ConflictException('Email is already registered');
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: { email: dto.email, passwordHash, name: dto.name },
            select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
        });
        return this.buildTokenResponse(user);
    }
    async login(dto) {
        const user = await this.users.findByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const { passwordHash: _ph, ...safeUser } = user;
        return this.buildTokenResponse(safeUser);
    }
    async refreshTokens(payload) {
        const user = await this.users.findById(payload.sub);
        if (!user)
            throw new common_1.UnauthorizedException('User no longer exists');
        return this.buildTokenResponse(user);
    }
    buildTokenResponse(user) {
        const jwtPayload = {
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
            user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map