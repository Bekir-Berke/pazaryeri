import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { StoreModule } from './store/store.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { RedisModule } from './redis/redis.module';
import { BrandModule } from './brand/brand.module';
import { UploadModule } from './upload/upload.module';
import { CartModule } from './cart/cart.module';
import { CompanyModule } from './company/company.module';
import { OrderModule } from './order/order.module';
import { CardModule } from './card/card.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PdfModule } from './pdf/pdf.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AdminModule } from './admin/admin.module';
import { ReviewModule } from './review/review.module';
import { CouponModule } from './coupon/coupon.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({envFilePath: '.env'}), AddressModule, StoreModule, ProductModule, CategoryModule, RedisModule, BrandModule, UploadModule, CartModule, CompanyModule, OrderModule, CardModule, InvoiceModule, PdfModule, FavoritesModule, AdminModule, ReviewModule, CouponModule, ThrottlerModule.forRoot({
    throttlers:[{
      ttl:60000,
      limit:15
    }]
  })],
  controllers: [AppController],
  providers: [AppService, {provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule {}
