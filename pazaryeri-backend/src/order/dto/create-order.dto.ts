import { IsNotEmpty, IsString } from 'class-validator';
export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  cardId: string;
}
