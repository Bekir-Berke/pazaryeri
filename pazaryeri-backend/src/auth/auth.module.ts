import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaModule } from 'src/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from 'src/address/address.module';
import { StoreService } from 'src/store/store.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { ConfigModule } from '@nestjs/config';
import { CartService } from 'src/cart/cart.service';

@Module({
  imports: [PrismaModule, UsersModule, JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,

  }),
  AddressModule,
  RedisModule,
  ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, StoreService, RedisService, CartService],
})
export class AuthModule {}
