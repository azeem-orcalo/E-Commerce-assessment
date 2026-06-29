import { PrismaService } from '../prisma/prisma.service';
export declare class FavoritesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    toggle(userId: string, productId: string): Promise<{
        productId: string;
        favorited: boolean;
    }>;
    check(userId: string, productId: string): Promise<{
        productId: string;
        favorited: boolean;
    }>;
    list(userId: string): Promise<{
        data: {
            favorited: boolean;
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
        }[];
    }>;
}
