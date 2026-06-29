import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            price: Prisma.Decimal;
            imageUrl: string | null;
            stock: number;
            deletedAt: Date | null;
            material: string | null;
            variants: Prisma.JsonValue | null;
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
    create(dto: CreateProductDto): Promise<{
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        description: string;
        price: Prisma.Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: Prisma.JsonValue | null;
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
        price: Prisma.Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: Prisma.JsonValue | null;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
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
        price: Prisma.Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: Prisma.JsonValue | null;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private resolveOrderBy;
}
