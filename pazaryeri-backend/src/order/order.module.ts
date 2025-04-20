import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'src/prisma.service';
import {RedisService} from '../redis/redis.service';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, RedisService],
})
export class OrderModule {}
