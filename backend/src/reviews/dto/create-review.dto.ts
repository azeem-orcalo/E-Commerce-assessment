import { IsInt, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(1)
  comment: string;
}
