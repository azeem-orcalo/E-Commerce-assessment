import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
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
