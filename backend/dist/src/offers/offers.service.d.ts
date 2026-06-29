import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOfferDto): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findNearest(): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findActive(): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateOfferDto): Promise<{
        id: string;
        title: string;
        description: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
