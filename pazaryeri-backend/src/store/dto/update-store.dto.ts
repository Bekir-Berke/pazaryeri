import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
    @IsOptional()
    @IsEnum(StoreStatus)
    status: StoreStatus;
}
