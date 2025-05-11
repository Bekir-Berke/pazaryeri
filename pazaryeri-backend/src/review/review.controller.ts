import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permissions.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_REVIEW)
  @UseInterceptors(FilesInterceptor('images', 5)) // En fazla 5 resim yüklenebilir
  async create(
    @Body() createReviewDto: CreateReviewDto, 
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const userId = req['user'].sub;
    
    // Resimler yüklendiyse, yükle ve URL'lerini ekle
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const imageUrl = await this.uploadService.uploadFile(file);
        imageUrls.push(imageUrl);
      }
      createReviewDto.imageUrls = imageUrls;
    }
    
    return this.reviewService.create(userId, createReviewDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
