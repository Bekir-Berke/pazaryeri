import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_CATEGORY)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_CATEGORY)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_CATEGORY)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Post('sub')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.CREATE_CATEGORY)
  createSubCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }
  
  @Get('sub')
  findAllSubCategories() {
    return this.categoryService.findAllSubCategories();
  }

  @Get('sub/:id')
  findOneSubCategory(@Param('id') id: string) {
    return this.categoryService.findOneSubCategory(id);
  }

  @Patch('sub/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_CATEGORY)
  updateSubCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {  
    return this.categoryService.updateSubCategory(id, updateCategoryDto);
  }

  @Delete('sub/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_CATEGORY)
  removeSubCategory(@Param('id') id: string) {
    return this.categoryService.removeSubCategory(id);
  }

}
