import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        data: {
            id: string;
            name: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(name: string): Promise<{
        id: string;
        name: string;
    }>;
    update(id: string, name: string): Promise<{
        id: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private findOneOrFail;
}
