import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
} from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'Eid Special Sale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '20% off on every product this Eid!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 20, description: 'Discount percentage (1–100)' })
  @IsNumber()
  @IsPositive()
  @Max(100)
  discountPercent: number;

  @ApiProperty({ example: '2025-03-30T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-04-05T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/eid-banner.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
