import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductFilterDto {
  // Mevcut filtreler
  @IsOptional()
  @IsString()
  search?: string;
  
  @IsOptional()
  @IsString()
  categoryId?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brand?: string[];
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
  
  @IsOptional()
  @IsString()
  color?: string;
  
  @IsOptional()
  @IsString()
  size?: string;
  
  // Varyant filtreleme seçenekleri
  @IsOptional()
  @IsString()
  variantName?: string;  // Varyant adına göre filtreleme
  
  @IsOptional()
  @IsString()
  variantSku?: string;   // Varyant SKU'suna göre filtreleme
  
  // Pagination ve sıralama
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
  
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
  
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}