import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateReviewDto): Promise<{
        user: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
        rating: number;
        comment: string;
        orderId: string;
    }>;
    findByProduct(productId: string): Promise<({
        user: {
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
        rating: number;
        comment: string;
        orderId: string;
    })[]>;
    checkReviewed(userId: string, productId: string, orderId: string): Promise<{
        reviewed: boolean;
        review: {
            id: string;
            createdAt: Date;
            userId: string;
            productId: string;
            rating: number;
            comment: string;
            orderId: string;
        } | null;
    }>;
}
