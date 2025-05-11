import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles, UseGuards, Req, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService, private uploadService: UploadService) { }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_PRODUCT)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product-image', maxCount: 5 }, // Ana ürün resimleri
      { name: 'variant-image', maxCount: 5 } // Varyant resimleri
    ])
  )
  async create(
    @Req() req: Request,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: { 'product-image'?: Express.Multer.File[], 'variant-image'?: Express.Multer.File[] }
  ) {
    try {
      createProductDto.storeId = req['user'].sub;

      // Ana ürün resimlerini işle
      let productImageUrls: any = [];
      if (files['product-image'] && files['product-image'].length > 0) {
        for (const file of files['product-image']) {
          const imageUrl = await this.uploadService.uploadFile(file);
          productImageUrls.push({ url: imageUrl });
        }
      }

      // Varyant resimlerini işle
      let variantImageUrls: any = [];
      if (files['variant-image'] && files['variant-image'].length > 0) {
        for (const file of files['variant-image']) {
          const imageUrl = await this.uploadService.uploadFile(file);
          variantImageUrls.push({ url: imageUrl });
        }
      }

      createProductDto.imageUrl = productImageUrls[0]?.url || null;
      createProductDto.images = productImageUrls;
      if(createProductDto.variants){
        createProductDto.variants.forEach((variant: any, index: number) => {
          if (variantImageUrls[index]) {
            variant.imageUrl = variantImageUrls[index].url;
          }
        });
      }

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

  @Get('search')
  async search(@Query() searchParams: any) {
    try {
      const { 
        q, 
        categories, 
        brands, 
        min_price, 
        max_price, 
        sort = 'newest', 
        page = 1, 
        limit = 24 
      } = searchParams;

      // İstek parametrelerini product service'e ilet
      const searchResults = await this.productService.search({
        q,
        categories,
        brands,
        min_price,
        max_price,
        sort,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return {
        success: true,
        products: searchResults.products,
        pagination: searchResults.pagination,
        availableFilters: searchResults.availableFilters
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        message: 'Arama sırasında bir hata oluştu',
        error: error.message,
        products: [],
        pagination: {
          total: 0,
          page: parseInt(searchParams.page) || 1,
          limit: parseInt(searchParams.limit) || 24,
          totalPages: 0
        },
        availableFilters: {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 0, avg: 0 }
        }
      };
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user']?.sub;
    return this.productService.findOne(id, userId ? userId : null);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_PRODUCT)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product-image', maxCount: 5 },
      { name: 'variant-image', maxCount: 5 }
    ])
  )
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request, @UploadedFiles() files: { 'product-image'?: Express.Multer.File[], 'variant-image'?: Express.Multer.File[] }) {
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
