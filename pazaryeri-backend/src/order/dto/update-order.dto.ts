import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString } from 'class-validator';
export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    addressId: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    cardId: string;
}
