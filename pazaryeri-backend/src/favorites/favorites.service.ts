import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma:PrismaService){}
  create(userId:string, createFavoriteDto: CreateFavoriteDto) {
    try {
      return this.prisma.favorite.create({
        data: {
          userId: userId,
          productId: createFavoriteDto.productId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Daha önce bu ürünü favorilerinize eklediniz.');
      } else {
        throw error;
      }
    }
  }

  findAll() {
    return `This action returns all favorites`;
  }

  findOne(id: string) {
    return this.prisma.favorite.findMany({
      where: {
        userId:id,
      },
      include: {
        product:{
          select:{
            id:true,
            name:true,
            vatPrice:true,
            imageUrl:true
          }
        }
      },
    });
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }

  remove(userId:string, id: string) {
    return this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: id,
        }
      },
    });
  }
}
