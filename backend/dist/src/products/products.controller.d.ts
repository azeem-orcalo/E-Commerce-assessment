import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryProductsDto): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
            deletedAt: Date | null;
            material: string | null;
            variants: import("@prisma/client/runtime/client").JsonValue | null;
            categoryId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: string;
    }>;
}
