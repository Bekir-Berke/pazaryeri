import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {AuthGuard} from '../auth/auth.guard';
import {PermissionsGuard} from '../auth/permissions.guard';
import {UseGuards} from '@nestjs/common';
import {Permissions} from '../auth/permissions.decorator';
import {Permission} from '../auth/permissions.enum';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.CREATE_ORDER)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.orderService.create(userId, createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.READ_ORDER)
  findOne(@Param('id') id: string, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.orderService.findOne(userId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }
  
  @Patch(':id/status')
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.UPDATE_ORDER)
  updateStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateStatus(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
