import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class OrderAddressDto{
  addressTitle: string;
  fullName: string;
  phone: string
  city: string
  district: string
  neighborhood: string
  fullAddress: string  
}
export class OrderCardDto{
  cardHolderName:string
  cardNumber:string
  cardBrand:string
  cardType:string
  cartIssuer:string
  expiryMonth:number
  expiryYear:number
  cvv:string
}
export class CreateOrderDto {
  @IsOptional()
  @IsString()
  addressId: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  cardId: string;
  
  @IsOptional()
  card: OrderCardDto;

  @IsOptional()
  address: OrderAddressDto;

  @IsOptional()
  couponId: string;

  @IsOptional()
  couponCode: string;
}