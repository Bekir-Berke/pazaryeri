import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Post('sub')
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
  updateSubCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {  
    return this.categoryService.updateSubCategory(id, updateCategoryDto);
  }

  @Delete('sub/:id')
  removeSubCategory(@Param('id') id: string) {
    return this.categoryService.removeSubCategory(id);
  }

}
