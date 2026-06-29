"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OffersService = class OffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.offer.create({
            data: {
                title: dto.title,
                description: dto.description,
                discountPercent: dto.discountPercent,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                isActive: dto.isActive ?? true,
                imageUrl: dto.imageUrl ?? null,
            },
        });
    }
    async findAll() {
        return this.prisma.offer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findNearest() {
        const now = new Date();
        const active = await this.prisma.offer.findFirst({
            where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
            orderBy: { endDate: 'asc' },
        });
        if (active)
            return active;
        return this.prisma.offer.findFirst({
            where: { isActive: true, startDate: { gt: now } },
            orderBy: { startDate: 'asc' },
        });
    }
    async findActive() {
        const now = new Date();
        return this.prisma.offer.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async findOne(id) {
        const offer = await this.prisma.offer.findUnique({ where: { id } });
        if (!offer)
            throw new common_1.NotFoundException(`Offer ${id} not found`);
        return offer;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.offer.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
                ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
                ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.offer.delete({ where: { id } });
        return { message: 'Offer deleted successfully' };
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
//# sourceMappingURL=offers.service.js.map