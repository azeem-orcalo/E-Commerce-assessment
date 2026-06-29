import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /** GET /favorites — all favorited products for the current user */
  @Get()
  @ApiOperation({ summary: "List all of the user's favorited products" })
  list(@CurrentUser('id') userId: string) {
    return this.favoritesService.list(userId);
  }

  /** GET /favorites/:productId — check if a product is favorited */
  @Get(':productId')
  @ApiOperation({ summary: 'Check whether a product is in the user favorites' })
  check(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.check(userId, productId);
  }

  /** POST /favorites/:productId — toggle favorite on/off */
  @Post(':productId')
  @ApiOperation({ summary: 'Toggle favorite — adds if not present, removes if already saved' })
  toggle(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.toggle(userId, productId);
  }

  /** DELETE /favorites/:productId — explicit remove (alias for toggle when favorited) */
  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from favorites' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const existing = await this.favoritesService.check(userId, productId);
    if (!existing.favorited) return { productId, favorited: false };
    return this.favoritesService.toggle(userId, productId);
  }
}
