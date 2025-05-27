import { Injectable, NotFoundException } from '@nestjs/common';
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
    const store =  await this.prisma.store.findFirst(
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
            where:{
              deletedAt:null
            },
            include: {
              brand: true,
              attributes: true,
              images: true,
              variants: true,
              categories: true
            }
          },
          Coupon:{
            where:{
              deletedAt:null,
            },
            select:{
              id:true,
              code:true,
              description:true,
              value:true,
              type:true,
              isActive:true,
              startDate:true,
              minOrderAmount:true,
              endDate:true,
              perUserLimit:true,
              usageLimit:true,
              usedCount:true
            }
          },
          invoices:{
            select:{
              id:true,
              invoiceNumber:true,
              orderId:true,
              amount:true,
              taxAmount:true,
              paidAt:true,
              issuedAt:true,
              items:{
                select:{
                  id:true,
                  description:true,
                  quantity:true,
                  unitPrice:true,
                  totalPrice:true,
                  taxAmount:true,
                  vatRate:true,
                }
              }
            }
          }
        }
      }
    )
    const orders = await this.findStoreOrders(id);
    const reviews = await this.findStoreReviews(id);
    return { ...store, orders, reviews };
  }

  findStoreProducts(id: string) {
    return this.prisma.product.findMany({ where: { storeId: id } });
  }

  findOneByEmail(email: string) {
    return this.prisma.store.findUnique({ where: { email } });
  }
  
  async findStoreProfile(id: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        AND:[
          {id},
          {deletedAt:null},
          {status:'APPROVED'}
        ]
      },
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
    if(!store){
      throw new NotFoundException('Store not found');
    }
    return store;
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
        deletedAt:null,
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
        Coupon:{
          select:{
            id:true,
            code:true,
            description:true,
            value:true,
            type:true,
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
  async findStoreReviews(storeId: string) {
    return this.prisma.review.findMany({
      where:{
        orderItem:{
          product:{
            storeId
          }
        }
      },
      select:{
        id:true,
        rating:true,
        comment:true,
        imageUrls:true,
        createdAt:true,
        orderItem:{
          select:{
            productName:true,
            productId:true,
            variantId:true,
            variantName:true,
          }
        }
      }   
    })
  }
}
