import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
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
