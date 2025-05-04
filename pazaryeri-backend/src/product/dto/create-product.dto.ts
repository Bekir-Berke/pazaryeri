import { Transform, Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsNotEmpty, 
  IsBoolean, 
  IsUUID, 
  ValidateNested, 
  ArrayMinSize,
  IsEAN,
  Matches,
  MaxLength,
  MinLength,
  IsDecimal
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Ürün adı zorunludur' })
  @IsString()
  @MinLength(3, { message: 'Ürün adı en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Ürün adı en fazla 100 karakter olabilir' })
  name: string;

  @IsNotEmpty({ message: 'Ürün açıklaması zorunludur' })
  @IsString()
  @MinLength(10, { message: 'Ürün açıklaması en az 10 karakter olmalıdır' })
  description: string;

  @IsNotEmpty({ message: 'Fiyat zorunludur' })
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Geçerli bir fiyat giriniz (ör: 99.99)' })
  @Type(() => parseFloat)
  price: number; // Decimal türü için string olarak alıp Prisma'da dönüştüreceğiz

  @IsNotEmpty({ message: 'KDV oranı zorunludur' })
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Geçerli bir KDV oranı giriniz (ör: 18.00)' })
  @Type(() => parseFloat)
  vatRate: number;

  @IsNotEmpty({ message: 'Marka ID zorunludur' })
  @IsUUID('all', { message: 'Geçerli bir marka ID giriniz' })
  brandId: string;

  @IsNotEmpty({ message: 'Stok miktarı zorunludur' })
  @IsNumber({}, { message: 'Geçerli bir stok miktarı giriniz' })
  @Type(() => Number)
  stock: number;

  @IsNotEmpty({ message: 'SKU zorunludur' })
  @IsString()
  @Matches(/^[A-Za-z0-9\-]+$/, { message: 'SKU sadece harf, rakam ve tire içerebilir' })
  @MinLength(3, { message: 'SKU en az 3 karakter olmalıdır' })
  @MaxLength(20, { message: 'SKU en fazla 20 karakter olabilir' })
  sku: string;

  @IsNotEmpty({ message: 'Barkod zorunludur' })
  @Matches(/^[0-9]{13}$/, { message: 'Geçerli bir barkod numarası giriniz (13 haneli)' })
  barcode: string;

  @IsOptional()
  @IsNumber({}, { message: 'Geçerli bir ağırlık değeri giriniz (gram cinsinden)' })
  weight?: number;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9x\/\-\s]+$/, { message: 'Geçerli bir boyut formatı giriniz (ör: 10x15x5)' })
  dimensions?: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFeature: boolean = false;

  @IsNotEmpty({ message: 'Ana ürün görseli zorunludur' })
  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.*\.(jpeg|jpg|png|webp|gif)$/, { 
    message: "Geçerli bir görsel URL'i giriniz (http://... veya https://...)"
  })
  imageUrl: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  @Transform(({ value }) => JSON.parse(value)) 
  attributes?: ProductAttributeDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @Transform(({ value }) => JSON.parse(value)) 
  variants?: ProductVariantDto[];

  @IsNotEmpty({ message: 'En az bir kategori seçilmelidir' })
  @ArrayMinSize(1, { message: 'En az bir kategori seçilmelidir' })
  @ValidateNested({ each: true })
  @Type(() => ProductCategoryDto)
  @Transform(({ value }) => JSON.parse(value)) 
  categories: ProductCategoryDto[];
  
  @IsNotEmpty({ message: 'Mağaza ID zorunludur' })
  @IsOptional()
  @IsUUID('all', { message: 'Geçerli bir mağaza ID giriniz' })
  storeId: string;
}

export class ProductImageDto {
  @IsOptional()
  @IsUUID('all', { message: 'Geçerli bir UUID giriniz' })
  id?: string;
  
  @IsNotEmpty({ message: 'Görsel URL zorunludur' })
  @IsString()
  @Matches(/^https?:\/\/.*\.(jpeg|jpg|png|webp)$/, { 
    message: "Geçerli bir görsel URL'i giriniz"
  })
  url: string;
}

export class ProductAttributeDto {
  @IsOptional()
  @IsUUID('all', { message: 'Geçerli bir UUID giriniz' })
  id?: string;
  
  @IsNotEmpty({ message: 'Özellik adı zorunludur' })
  @IsString()
  name: string;
  
  @IsNotEmpty({ message: 'Özellik değeri zorunludur' })
  @IsString()
  value: string;
}

export class ProductVariantDto {
  @IsOptional()
  @IsUUID('all', { message: 'Geçerli bir UUID giriniz' })
  id?: string;
  
  @IsNotEmpty({ message: 'Varyant adı zorunludur' })
  @IsString()
  name: string;
  
  @IsNotEmpty({ message: 'SKU zorunludur' })
  @IsString()
  @Matches(/^[A-Za-z0-9\-]+$/, { message: 'SKU sadece harf, rakam ve tire içerebilir' })
  sku: string;
  
  @IsNotEmpty({ message: 'Fiyat zorunludur' })
  @IsNumber({}, { message: 'Geçerli bir fiyat giriniz' })
  price: number;
  
  @IsNotEmpty({ message: 'Stok miktarı zorunludur' })
  @IsNumber({}, { message: 'Geçerli bir stok miktarı giriniz' })
  stock: number;
  
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\/.*\.(jpeg|jpg|png|webp)$/, { 
    message: "Geçerli bir görsel URL'i giriniz"
  })
  imageUrl?: string;
}

export class ProductCategoryDto {
  @IsNotEmpty({ message: 'Kategori ID zorunludur' })
  @IsUUID('all', { message: 'Geçerli bir kategori ID giriniz' })
  categoryId: string;
}