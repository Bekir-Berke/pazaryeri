import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      where: {
        parentId: null,  // Sadece ana kategoriler
      },
      orderBy: {
        level: 'asc',  // Ana kategorileri level'e göre sırala
      },
      include: {
        children: {
          orderBy: {
            level: 'asc',  // Alt kategorileri level'e göre sırala
          },
          include: {
            children: {
              orderBy: {
                level: 'asc',  // Alt-alt kategorileri level'e göre sırala
              },
              include: {
                children: {
                  orderBy: {
                    level: 'asc',  // En alt seviye kategorileri level'e göre sırala
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: {id},
      include:{
        children:true
      }
    });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: {id},
      data: updateCategoryDto
    }); 
  }

  remove(id: string) {
    return this.prisma.category.delete({
      where: {id}
    });
  }

  createSubCategory(createSubCategoryDto:CreateSubCategoryDto){
    return this.prisma.category.create({
      data: createSubCategoryDto
    });
  }

  findAllSubCategories(){
    return this.prisma.category.findMany({
      where:{
        parentId:{
          not:null
        }
      }
    });
  }

  findOneSubCategory(id:string){
    return this.prisma.category.findUnique({
      where: {id}
    });
  }

  updateSubCategory(id: string, updateCategoryDto: UpdateCategoryDto){
    return this.prisma.category.update({
      where: {id},
      data: updateCategoryDto
    });
  }

  removeSubCategory(id: string){
    return this.prisma.category.delete({
      where: {id}
    });
  }
}
