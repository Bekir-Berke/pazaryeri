import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PdfService } from 'src/pdf/pdf.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService,RedisService,ConfigService,PdfService, UploadService],
})
export class InvoiceModule {}
