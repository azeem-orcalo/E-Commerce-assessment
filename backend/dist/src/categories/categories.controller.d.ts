import { CategoryDto } from './dto/category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(page?: string, limit?: string, search?: string): Promise<{
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
