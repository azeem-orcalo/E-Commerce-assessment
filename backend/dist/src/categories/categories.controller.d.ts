import { CategoryDto } from './dto/category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(dto: CategoryDto): Promise<{
        id: string;
        name: string;
    }>;
    update(id: string, dto: CategoryDto): Promise<{
        id: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
