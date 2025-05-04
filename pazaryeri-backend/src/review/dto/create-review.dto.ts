import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment:string;

  @IsOptional()
  @IsString()
  imageUrls?: string[];

  @IsNotEmpty()
  @IsString()
  orderItemId: string;
}
