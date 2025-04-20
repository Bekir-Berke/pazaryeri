import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {PrismaService} from '../prisma.service';
import {RedisService} from '../redis/redis.service';

@Injectable()
export class OrderService {
  constructor(private prisma:PrismaService, private redis:RedisService) {
  }
  async create(userId:string, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: userId,
      },
      include:{
        items:{
          include:{
            product:true,
            variant:true
          }
        }
      }
    })
    if (!cart) {
      throw new Error('Cart not found');
    }
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + (item.quantity * Number(item.price));
    }, 0);
    const status = 'PROCESSING';
    const orderNumber = await this.redis.generateOrderNumber();
    const order = await this.prisma.order.create({
      data: {
        addressId: createOrderDto.addressId,
        phone: createOrderDto.phone,
        cardId: createOrderDto.cardId,
        totalAmount: totalPrice,
        orderNumber: orderNumber,
        userId: userId,
      },
    })
    await this.prisma.orderItem.createMany(
      {
        data: cart.items.map((item) => ({
          orderId: order.id,
          status: status,
          productId: item.productId,
          variantId: item.variantId ? item.variantId : null,
          quantity: item.quantity,
          price: item.price,
          storeId: item.product.storeId,
          productName: item.product.name,
        })),
      }
    )
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    })
    await this.prisma.product.updateMany({
      where: {
        id: {
          in: cart.items.map((item) => item.productId),
        },
      },
      data: {
        stock: {
          decrement: cart.items.reduce((acc, item) => {
            return acc + item.quantity;
          }, 0),
        },
      },
    })
    return {orderNumber: orderNumber};
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(userId:string, id: string) {
    return this.prisma.order.findUnique({
      where:{
        userId:userId,
        id: id
      },
      select:{
        orderNumber:true,
        totalAmount:true,
        createdAt:true,
        id:true,
        phone:true,
        card:{
          select:{
            id:true,
            cardNumber:true,
            cardHolderName:true,
            cardType:true,
            expiryMonth:true,
            expiryYear:true,
          }
        },
        address:{
          select:{
            id:true,
            addressTitle:true,
            fullAddress:true,
            city:true,
            district:true,
            neighborhood:true,
            phone:true
          }
        },
        items:{
          select:{
            id:true,
            status:true,
            product:{
              select:{
                id:true,
                name:true,
                imageUrl:true,
                storeId:true,
                store:{
                  select:{
                    id:true,
                    name:true
                  }
                }
              }
            },
            variant:{
              select:{
                id:true,
                name:true
              }
            },
            quantity:true,
            price:true
          }
        },
      }
    })
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  updateStatus(id: string, data:any) {
  const status = data.status;
    return this.prisma.orderItem.update({
      where: { id },
      data:{status: {set:status}},
    })
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
