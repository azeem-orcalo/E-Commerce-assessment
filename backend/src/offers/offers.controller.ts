import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /** Public — active offers within current date window */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all currently active offers (public)' })
  findActive() {
    return this.offersService.findActive();
  }

  /** Admin — all offers regardless of status/date */
  @Roles(Role.ADMIN)
  @Get('all')
  @ApiOperation({ summary: 'Get all offers including inactive (admin)' })
  findAll() {
    return this.offersService.findAll();
  }

  /** Public — nearest single offer (active first, then next upcoming) */
  @Public()
  @Get('nearest')
  @ApiOperation({ summary: 'Get nearest offer for hero banner (public)' })
  findNearest() {
    return this.offersService.findNearest();
  }

  /** Admin — single offer by id */
  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get single offer by ID (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.offersService.findOne(id);
  }

  /** Admin — create offer */
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new offer (admin)' })
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  /** Admin — update offer */
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.offersService.update(id, dto);
  }

  /** Admin — delete offer */
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.offersService.remove(id);
  }
}
