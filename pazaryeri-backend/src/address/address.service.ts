import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}
  create(id: string, createAddressDto: CreateAddressDto) {
    return this.prisma.address.create({data: {...createAddressDto, userId: id}});
  }

  findAll() {
    return this.prisma.address.findMany();
  }

  findUserAllAddresses(id: string) {
    return this.prisma.address.findMany({where: {userId
    : id}});
  }

  findOne(addressId: string) {
    return this.prisma.address.findUnique({where: {id: addressId}});
  }

  update(id: string, updateAddressDto: UpdateAddressDto) {
    return this.prisma.address.update({
      where:{
        id:id
      },data:{
        ...updateAddressDto
      }
    })
  }
  async setDefault(userId:string, id: string) {
    await this.prisma.address.updateMany({
      where: {
        userId: userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    return this.prisma.address.update({
      where: {
        id: id,
      },
      data: {
        isDefault: true,
      },
    });
  }

  remove(userId:string, id: string) {
    return  this.prisma.address.delete({
      where:{
        userId:userId,
        id:id
      }
    });
  }
}
