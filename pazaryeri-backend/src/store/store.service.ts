import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from 'src/prisma.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) { }
  create(createStoreDto: CreateStoreDto) {
    createStoreDto.password = bcrypt.hashSync(createStoreDto.password, 10);
    return this.prisma.store.create({ data: { ...createStoreDto, status: 'PENDING' } });
  }
  findAll() {
    return this.prisma.store.findMany({ include: { companyType: true, products: true } });
  }

  async findOne(id: string) {
    const store =  await this.prisma.store.findUnique(
      {
        where: { id },
        select: {
          id: true,
          address: true,
          email: true,
          iban: true,
          status:true,
          ownerFirstName: true,
          ownerLastName: true,
          ownerEmail: true,
          ownerPhone: true,
          phone: true,
          taxNumber: true,
          taxOffice: true,
          companyName: true,
          createdAt: true,
          companyType: {
            select: {
              id: true,
              name: true,
              taxRate: true,
            }
          },
          products: {
            include: {
              brand: true,
              attributes: true,
              images: true,
              variants: true,
              categories: true
            }
          },
        }
      }
    )
    const orders = await this.findStoreOrders(id);
    return { ...store, orders };
  }

  findStoreProducts(id: string) {
    return this.prisma.product.findMany({ where: { storeId: id } });
  }

  findOneByEmail(email: string) {
    return this.prisma.store.findUnique({ where: { email } });
  }
  
  findStoreProfile(id: string) {
    return this.prisma.store.findUnique({
      where: {id},
      select:{
        id: true,
        address: true,
        name:true,
        email: true,
        phone: true,
        products:{
          where:{
            isActive:true,
          },
          select:{
            id:true,
            name:true,
            vatPrice:true,
            imageUrl:true
          }
        }
      }
    })
  }

  update(id: string, updateStoreDto: UpdateStoreDto) {
    if (updateStoreDto.password) {
      updateStoreDto.password = bcrypt.hashSync(updateStoreDto.password, 10);
    }
    return this.prisma.store.update({ where: { id }, data: updateStoreDto });
  }

  remove(id: string) {
    return this.prisma.store.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  async findStoreOrders(storeId: string) {
    return this.prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              storeId
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        address: {
          select: {
            id: true,
            city: true,
            district: true,
            neighborhood: true,
            fullAddress: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                store: {
                  select: {
                    id: true,
                    companyName: true
                  }
                },
                variants: true,
                images: true
              }
            },
            variant: true
          },
          where: {
            product: {
              storeId
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
