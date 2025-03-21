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

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({envFilePath: '.env'}), AddressModule, StoreModule, ProductModule, CategoryModule, RedisModule, BrandModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
