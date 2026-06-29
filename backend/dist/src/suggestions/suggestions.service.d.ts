import { PrismaService } from '../prisma/prisma.service';
export declare class SuggestionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSuggestions(userId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: {
            id: string;
            name: string;
        };
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        categoryId: string;
    }[]>;
    getPopular(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: {
            id: string;
            name: string;
        };
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        categoryId: string;
    }[]>;
}
