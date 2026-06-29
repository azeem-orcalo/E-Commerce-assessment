import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0, description: 'Set to 0 to remove the item' })
  @IsInt()
  @Min(0)
  quantity: number;
}
