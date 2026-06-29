import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a review for a product in a shipped order' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto);
  }

  @Get('product')
  @Public()
  @ApiOperation({ summary: 'Get all reviews for a product' })
  findByProduct(@Query('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if current user has reviewed a product for a given order' })
  checkReviewed(
    @CurrentUser('id') userId: string,
    @Query('productId') productId: string,
    @Query('orderId') orderId: string,
  ) {
    return this.reviewsService.checkReviewed(userId, productId, orderId);
  }
}
