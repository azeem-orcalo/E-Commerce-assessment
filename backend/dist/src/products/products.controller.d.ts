import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
            name: string;
            description: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            imageUrl: string | null;
            stock: number;
            deletedAt: Date | null;
            material: string | null;
            variants: import("@prisma/client/runtime/client").JsonValue | null;
            categoryId: string;
            createdAt: Date;
            updatedAt: Date;
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
        name: string;
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateProductDto): Promise<{
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        description: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: import("@prisma/client/runtime/client").JsonValue | null;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
