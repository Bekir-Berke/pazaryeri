import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles, UseGuards, Req, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService, private uploadService:UploadService) {}
  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_PRODUCT)
  @UseInterceptors(FileInterceptor('product-image'))
  async create(
    @Req() req: Request,
    @Body() createProductDto: CreateProductDto, 
    @UploadedFile() file: Express.Multer.File
  ) {
    createProductDto.storeId = req['user'].sub;
    const imageUrl = await this.uploadService.uploadFile(file);
    createProductDto.imageUrl = imageUrl;
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
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_PRODUCT)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request) {
    updateProductDto.storeId = req['user'].sub;
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_PRODUCT)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
