import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
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
