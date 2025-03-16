import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService, private uploadService:UploadService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() createProductDto: CreateProductDto, 
  ) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() filterDto: ProductFilterDto) {
    return this.productService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
