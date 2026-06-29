import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus, Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Admin')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List all orders (paginated, filterable by status)' })
  getOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: OrderStatus,
  ) {
    return this.adminService.getOrders(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, parseInt(limit, 10) || 10),
      status,
    );
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status (CANCELLED restocks items)' })
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(orderId, dto.status);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Dashboard stats: revenue, orders by status, top products' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
