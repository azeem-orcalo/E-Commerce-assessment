import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
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
    check(userId: string, productId: string): Promise<{
        productId: string;
        favorited: boolean;
    }>;
    toggle(userId: string, productId: string): Promise<{
        productId: string;
        favorited: boolean;
    }>;
    remove(userId: string, productId: string): Promise<{
        productId: string;
        favorited: boolean;
    }>;
}
