import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { AddressService } from 'src/address/address.service';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private addressService:AddressService, private cartService:CartService) {}

  create(createUserDto: CreateUserDto) {
    this.prisma.user.create({data: createUserDto}).catch((error: PrismaClientKnownRequestError) => {
      if (error.code === 'P2002') {
        throw new ConflictException('Bu email adresi kullanılmaktadır.');
      }
      throw new InternalServerErrorException();
    }).then((user) => {
      return this.cartService.create(user.id)
    })
  }

  findAll() {
    return this.prisma.user.findMany({
      select:{
        id:true,
        firstName:true,
        lastName:true,
        isActive:true,
        email:true,
        createdAt:true,
        role:true
      }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({where: {id}});
  }
  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({where: {email}});
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({where: {id}, data: updateUserDto});
  }

  remove(id: string) {
    return this.prisma.user.update({where: {id}, data: {deletedAt: new Date()}});
  }

  getProfile(id: string) {
    return this.prisma.user.findUnique({where: {id}, 
    select:{
      id:true,
      email:true,
      firstName:true,
      lastName:true,
      createdAt:true,
      isActive:true,
      addresses:{
        where:{deletedAt:null},
      },
      cards:{
        where:{deletedAt:null},
      },
      orders:{
        where:{deletedAt:null},
        select:{
          id:true,
          createdAt:true,
          totalAmount:true,
          orderNumber:true,
          invoices:{
            select:{
              id:true,
              issuedAt:true,
              invoiceNumber:true,
              pdfUrl:true,
            }
          },
          items:{
            select:{
              id:true,
              Review:{
                select:{
                  id:true,
                  createdAt:true,
                  comment:true,
                  rating:true,
                  imageUrls:true
                }
              },
              status:true,
              vatPrice:true,
              quantity:true,
              product:{
                select:{
                  imageUrl:true,
                  store:{
                    select:{
                      id:true,
                      name:true,
                    }
                  },
                  id:true,
                  name:true,
                  price:true,
                  images:true
                }
              }
            }
          }
        }
      },
      favorites:{
       where:{
        product:{
          deletedAt:null,
          isActive:true,
        }
       },
        select:{
          id:true,
          product:{
            select:{
              id:true,
              name:true,
              vatPrice:true,
              imageUrl:true,
              store:{
                select:{
                  id:true,
                  name:true
                }
              }
            }
          }
        }
      },
      reviews:{
        select:{
          id:true,
          comment:true,
          rating:true,
          createdAt:true,
          orderItem:{
            select:{
              productName:true,
              product:{
                select:{id:true, imageUrl:true}
              }
            }
          }
        }
      }
    }})
  }
}
