import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SuggestionsService } from './suggestions.service';

@ApiTags('Suggestions')
@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  /**
   * Personalised suggestions for the logged-in customer.
   * Uses category-affinity from their order history; falls back to bestsellers
   * for new users with no purchase history.
   */
  @Get()
  @ApiOperation({ summary: 'Personalised product suggestions (authenticated customer)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSuggestions(
    @CurrentUser('id') userId: string,
    @Query('limit') limit = '8',
  ) {
    return this.suggestionsService.getSuggestions(userId, Math.min(16, parseInt(limit, 10) || 8));
  }

  /**
   * Public bestsellers — no authentication required.
   * Suitable for the guest homepage and unauthenticated product detail pages.
   */
  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Global bestsellers — public endpoint (no auth needed)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPopular(@Query('limit') limit = '8') {
    return this.suggestionsService.getPopular(Math.min(16, parseInt(limit, 10) || 8));
  }
}
