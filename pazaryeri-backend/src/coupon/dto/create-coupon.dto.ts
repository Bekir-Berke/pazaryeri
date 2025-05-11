import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsDateString, IsArray, ValidateIf, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {CouponType} from '@prisma/client';

export class CreateCouponDto {
  @IsNotEmpty({ message: 'Kupon kodu zorunludur' })
  @IsString({ message: 'Kupon kodu bir metin olmalıdır' })
  code: string;

  @IsNotEmpty({ message: 'Kupon tipi zorunludur' })
  @IsEnum(CouponType, { message: 'Geçerli bir kupon tipi belirtiniz' })
  type: CouponType;

  @IsNotEmpty({ message: 'Kupon değeri zorunludur' })
  @IsNumber({}, { message: 'Kupon değeri bir sayı olmalıdır' })
  @Min(0, { message: 'Kupon değeri 0 veya daha büyük olmalıdır' })
  @Type(() => Number)
  value: number;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum sipariş tutarı bir sayı olmalıdır' })
  @Min(0, { message: 'Minimum sipariş tutarı 0 veya daha büyük olmalıdır' })
  @Type(() => Number)
  minOrderAmount?: number;

  @IsOptional()
  @ValidateIf(o => o.type === CouponType.PERCENTAGE)
  @IsNumber({}, { message: 'Maksimum indirim tutarı bir sayı olmalıdır' })
  @Min(0, { message: 'Maksimum indirim tutarı 0 veya daha büyük olmalıdır' })
  @Type(() => Number)
  maxDiscount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Kişi başı kullanım limiti bir sayı olmalıdır' })
  @Min(1, { message: 'Kişi başı kullanım limiti en az 1 olmalıdır' })
  @Type(() => Number)
  perUserLimit?: number;

  @IsNotEmpty({ message: 'Başlangıç tarihi zorunludur' })
  @IsDateString({}, { message: 'Geçerli bir başlangıç tarihi giriniz' })
  startDate: string;

  @IsNotEmpty({ message: 'Bitiş tarihi zorunludur' })
  @IsDateString({}, { message: 'Geçerli bir bitiş tarihi giriniz' })
  endDate: string;

  @IsOptional()
  @IsNumber({}, { message: 'Kullanım limiti bir sayı olmalıdır' })
  @Min(1, { message: 'Kullanım limiti en az 1 olmalıdır' })
  @Type(() => Number)
  usageLimit?: number;

  @IsOptional()
  @IsString({ message: 'Açıklama bir metin olmalıdır' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Aktiflik durumu boolean olmalıdır' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Geçerli bir mağaza ID giriniz' })
  storeId?: string;

  @IsOptional()
  @IsArray({ message: 'Kategoriler bir dizi olmalıdır' })
  @IsUUID('all', { each: true, message: 'Geçerli kategori ID\'leri giriniz' })
  categoryIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Ürünler bir dizi olmalıdır' })
  @IsUUID('all', { each: true, message: 'Geçerli ürün ID\'leri giriniz' })
  productIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Kullanıcılar bir dizi olmalıdır' })
  @IsUUID('all', { each: true, message: 'Geçerli kullanıcı ID\'leri giriniz' })
  userIds?: string[];
}

export class ApplyCouponDto {
  @IsNotEmpty({ message: 'Kupon kodu zorunludur' })
  @IsString({ message: 'Kupon kodu bir metin olmalıdır' })
  code: string;

  @IsOptional()
  @IsUUID('all', { message: 'Geçerli bir kullanıcı ID giriniz' })
  userId?: string;
}