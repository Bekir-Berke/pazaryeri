import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private redis: RedisService, private invoiceService: InvoiceService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + (item.quantity * Number(item.price));
    }, 0);
    const totalVatAmount = cart.items.reduce((acc, item) => {
      return acc + (Number(item.product.price) * Number(item.product.vatRate) / 100 * item.quantity);
    }, 0)
    
    const status = 'PROCESSING';
    const orderNumber = await this.redis.generateOrderNumber();
    
    const addressData = createOrderDto.addressId ? 
      { addressId: createOrderDto.addressId } : 
      {
        addressTitle: createOrderDto.address?.addressTitle || null,
        fullName: createOrderDto.address?.fullName || null,
        city: createOrderDto.address?.city || null,
        district: createOrderDto.address?.district || null,
        neighborhood: createOrderDto.address?.neighborhood || null,
        fullAddress: createOrderDto.address?.fullAddress || null,
      };
    
    const cardData = createOrderDto.cardId ? 
      { cardId: createOrderDto.cardId } : 
      {
        cardHolderName: createOrderDto.card?.cardHolderName || null,
        cardNumber: createOrderDto.card?.cardNumber || null,
        cardBrand: createOrderDto.card?.cardBrand || null,
        cardType: createOrderDto.card?.cardType || null,
        cardIssuer: createOrderDto.card?.cartIssuer || null,
        expiryMonth: createOrderDto.card?.expiryMonth ? Number(createOrderDto.card.expiryMonth) : null,
        expiryYear: createOrderDto.card?.expiryYear ? Number(createOrderDto.card.expiryYear) : null,
        cvv: createOrderDto.card?.cvv || null,
      };
    
    const order = await this.prisma.order.create({
      data: {
        ...addressData,
        userId: userId,
        phone: createOrderDto.phone,
        ...cardData,
        orderNumber: orderNumber,
        totalAmount: totalPrice,
        totalVatAmount: totalVatAmount,
      },
    });
    
    await this.prisma.orderItem.createMany(
      {
        data: cart.items.map((item) => ({
          orderId: order.id,
          status: status,
          productId: item.productId,
          variantId: item.variantId ? item.variantId : null,
          quantity: item.quantity,
          price: item.product.price,
          vatRate: item.product.vatRate,
          vatPrice: item.price,
          storeId: item.product.storeId,
          productName: item.product.name,
        })),
      }
    );
    
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    
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
      }
    });
    
    return {orderNumber: orderNumber};
  }

  findAll() {
    return `This action returns all order`;
  }

  async findOne(userId:string, id: string) {
    return await this.prisma.order.findUnique({
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
        addressTitle:true,
        fullName:true,
        city:true,
        district:true,
        neighborhood:true,
        fullAddress:true,
        cardNumber:true,
        cardHolderName:true,
        cardBrand:true,
        cardType:true,
        cardIssuer:true,
        expiryMonth:true,
        expiryYear:true,
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
        invoices:{
          select:{
            id:true,
            invoiceNumber:true,
            pdfUrl:true,
            createdAt:true,
            updatedAt:true
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
            vatPrice:true
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
