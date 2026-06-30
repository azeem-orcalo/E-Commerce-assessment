import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout: creates order from cart (COD or Stripe card)' })
  checkout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.checkout(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Get current user's order history" })
  getOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID (must belong to current user)' })
  getOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    return this.ordersService.getOrder(userId, orderId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all orders for the current user' })
  clearAll(@CurrentUser('id') userId: string) {
    return this.ordersService.clearAll(userId);
  }
}
