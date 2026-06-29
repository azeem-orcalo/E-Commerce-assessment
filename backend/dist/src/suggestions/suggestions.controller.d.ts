import { SuggestionsService } from './suggestions.service';
export declare class SuggestionsController {
    private readonly suggestionsService;
    constructor(suggestionsService: SuggestionsService);
    getSuggestions(userId: string, limit?: string): Promise<{
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
    getPopular(limit?: string): Promise<{
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
