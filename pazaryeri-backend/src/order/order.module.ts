import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from 'src/prisma.service';
import {RedisService} from '../redis/redis.service';
import {ConfigModule} from '@nestjs/config';
import { InvoiceService } from 'src/invoice/invoice.service';
import { PdfService } from 'src/pdf/pdf.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, RedisService, InvoiceService, PdfService, UploadService],
})
export class OrderModule {}
