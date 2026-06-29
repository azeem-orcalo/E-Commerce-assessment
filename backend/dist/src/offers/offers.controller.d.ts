import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
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
