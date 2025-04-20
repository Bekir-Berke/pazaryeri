import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CardService {
  constructor(private prisma:PrismaService){}
  create(id: string, createCardDto: CreateCardDto) {
    return this.prisma.card.create({
      data:{
        ...createCardDto,
        userId:id
      }
    })
  }

  findAll() {
    return this.prisma.card.findMany()
  }

  findOne(id: string) {
    return this.prisma.card.findUnique({where:{id:id}})
  }

  update(userId:string, id: string, updateCardDto: UpdateCardDto) {
    return this.prisma.card.update({
      where:{id, userId},
      data:{
        ...updateCardDto,
      }
    })
  }

  remove(userId:string, id: string) {
    return this.prisma.card.delete({where:{id, userId}})
  }
}
