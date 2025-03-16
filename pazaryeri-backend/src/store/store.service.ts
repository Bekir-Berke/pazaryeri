import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}
  create(createStoreDto: CreateStoreDto) {
    createStoreDto.password = bcrypt.hashSync(createStoreDto.password, 10);
    return this.prisma.store.create({data: createStoreDto});
  }
  findAll() {
    return this.prisma.store.findMany({include:{companyType:true, products:true}});
  }

  findOne(id: string) {
    return this.prisma.store.findUnique({where: {id}, include:{companyType:true, products:true}});
  }

  findStoreProducts(id: string){
    return this.prisma.product.findMany({where: {storeId: id}});
  }
  
  findOneByEmail(email: string) {
    return this.prisma.store.findUnique({where: {email}});
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    if(updateStoreDto.password){
      updateStoreDto.password = bcrypt.hashSync(updateStoreDto.password, 10);
    }
    return this.prisma.store.update({where: {id}, data: updateStoreDto});
  }

  remove(id: string) {
    return this.prisma.store.delete({where: {id}});
  }
}
