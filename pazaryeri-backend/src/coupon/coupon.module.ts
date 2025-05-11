import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { PrismaService } from '../prisma.service';
import { CouponController } from './coupon.controller';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService],
})
export class CouponModule {}
