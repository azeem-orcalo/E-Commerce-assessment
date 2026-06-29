import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            price: Prisma.Decimal;
            imageUrl: string | null;
            stock: number;
            deletedAt: Date | null;
            material: string | null;
            variants: Prisma.JsonValue | null;
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
        price: Prisma.Decimal;
        imageUrl: string | null;
        stock: number;
        deletedAt: Date | null;
        material: string | null;
        variants: Prisma.JsonValue | null;
        categoryId: string;
    }>;
    private resolveOrderBy;
}
