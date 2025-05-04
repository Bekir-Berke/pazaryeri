import { IsUUID, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  orderId: string;
}