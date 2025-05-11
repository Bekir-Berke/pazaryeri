import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permissions.enum';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_COUPON)
  create(@Body() createCouponDto: CreateCouponDto, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.couponService.create(createCouponDto, userId);
  }
  @Post('validate')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_ORDER)
  validate(@Body() data:any, @Req() req:Request){
    const userId = req['user'].sub;
    return this.couponService.validate(userId, data.couponCode);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard) 
  @Permissions(Permission.UPDATE_COUPON)
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.couponService.update(id, userId, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_COUPON)
  remove(@Param('id') id: string, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.couponService.remove(id, userId);
  }
}
