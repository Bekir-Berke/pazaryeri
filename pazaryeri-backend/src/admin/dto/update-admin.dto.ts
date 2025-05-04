import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
export class updateStoreApplicationDto{
    @IsString()
    @IsNotEmpty()
    status: StoreStatus;
}
