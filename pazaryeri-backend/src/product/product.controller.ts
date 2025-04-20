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
  constructor(private productService: ProductService, private uploadService: UploadService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_PRODUCT)
  @UseInterceptors(FilesInterceptor('product-image', 4))
  async create(
    @Req() req: Request,
    @Body() createProductDto: CreateProductDto, 
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      createProductDto.storeId = req['user'].sub;
      
      // Resim yükleme işlemi
      let imageUrls:any = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const imageUrl = await this.uploadService.uploadFile(file);
          imageUrls.push({ url: imageUrl });
        }
      }
      
      // Ürün bilgilerine resim URL'lerini ekle
      createProductDto.imageUrl = imageUrls[0]?.url || null; // Ana görsel
      createProductDto.images = imageUrls;
      
      // Ürünü veritabanına kaydet
      const product = await this.productService.create(createProductDto);
      
      return {
        success: true,
        message: 'Ürün başarıyla oluşturuldu',
        data: product
      };
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      return {
        success: false,
        message: 'Ürün oluşturulurken bir hata oluştu',
        error: error.message
      };
    }
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
    console.log('updateProductDto', updateProductDto);
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_PRODUCT)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
