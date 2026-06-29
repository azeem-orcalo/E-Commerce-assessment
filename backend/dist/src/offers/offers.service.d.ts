import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateOfferDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }[]>;
    findNearest(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    } | null>;
    findActive(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateOfferDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        imageUrl: string | null;
        title: string;
        discountPercent: import("@prisma/client-runtime-utils").Decimal;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
