import {
  Body,
  Controller,
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
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /** Public — any visitor can submit a contact query */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a contact query (public)' })
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  /** Admin — list all contact queries newest first */
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all contact queries (admin)' })
  findAll() {
    return this.contactService.findAll();
  }

  /** Admin — update read/resolved status */
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contact query status (admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto.status);
  }
}
