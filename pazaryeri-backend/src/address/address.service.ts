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

  findUserOneAddress(id: string, addressId: string) {
    return this.prisma.address.findUnique({where: {id: addressId}});
  }

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }

  update(id: string, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }
  setDefault(userId:string, id: string) {
    return this.prisma.address.update({where: {id}, data: {isDefault: true}});
  }

  remove(id: string) {
    return  this.prisma.address.delete({where: {id}});
  }
}
