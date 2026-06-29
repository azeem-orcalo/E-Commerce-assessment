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
    create(dto: CreateProductDto): Promise<{
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
    update(id: string, dto: UpdateProductDto): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
