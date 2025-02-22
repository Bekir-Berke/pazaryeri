import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { AddressService } from 'src/address/address.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private addressService:AddressService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({data: createUserDto}).catch((error: PrismaClientKnownRequestError) => {
      if (error.code === 'P2002') {
        throw new ConflictException('Bu email adresi kullanılmaktadır.');
      }
      throw new InternalServerErrorException();
    });
  }
  createAddress(id: string, createAddressDto: CreateAddressDto) {
    return this.addressService.create(id, createAddressDto);
  }

  findAll() {
    return this.prisma.user.findMany({include: {addresses:true}});
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({where: {id}});
  }
  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({where: {email}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return this.prisma.user.delete({where: {id}});
  }
}
