import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { PdfService } from 'src/pdf/pdf.service';
import { UploadService } from 'src/upload/upload.service';
import { AnyARecord } from 'dns';

@Injectable()
export class InvoiceService {
  constructor(private prisma:PrismaService, private redisService:RedisService, private pdfService:PdfService, private uploadService:UploadService){}
  
  async create(createInvoiceDto: CreateInvoiceDto, storeId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        storeId: storeId,
        orderId: createInvoiceDto.orderId,
      },
    });
    if (invoice) {
      throw new BadRequestException({
        message: 'Bu sipariş için zaten bir fatura oluşturulmuş',
        statusCode: 400,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl
      });
    }else{
      const order = await this.prisma.order.findUnique({
        where: {
          id: createInvoiceDto.orderId,
        },
        include: {
          user: true,
          address: true,
          items: {
            where: {
              storeId: storeId,
            },
            include: {
              store: true,
              product:true,
            }
          }
        }
      });
  
      if (!order) {
        throw new Error('Order not found');
      }
  
      if (order.items.length === 0) {
        throw new Error('No items found for this store in this order');
      }
  
      const store = await this.prisma.store.findUnique({
        where: {
          id: storeId,
        },
        include: {
          companyType: true
        }
      });
  
      if (!store) {
        throw new Error('Store not found');
      }
  
      const storeItemsTotal = order.items.reduce((total, item) => {
        return total + (Number(item.vatPrice) * item.quantity);
      }, 0);
  
      const taxAmount = order.items.reduce((total, item) => {
        return total + (Number(item.price) * Number(item.vatRate) / 100 * item.quantity);
      }, 0)
      const invoiceNumber = await this.redisService.generateInvoiceNumber();
      
      const invoice = await this.prisma.invoice.create({
        data: {
          orderId: createInvoiceDto.orderId,
          invoiceNumber: invoiceNumber,
          storeId: storeId,
          amount: storeItemsTotal,
          status: "CREATED",
          taxRate: store.companyType.taxRate,
          taxAmount: taxAmount,
          paidAt: order.createdAt,
          issuedAt: new Date(),
          items: {
            create: order.items.map((item) => ({
              unitPrice: item.price,
              quantity: item.quantity,
              totalPrice: Number(item.vatPrice) * item.quantity,
              taxAmount: Number(item.price) * Number(item.vatRate) / 100 * item.quantity,
              vatRate:item.vatRate,
              description: item.productName,
              orderItem: {
                connect: {
                  id: item.id
                }
              }
            }))
          }
        },
        include: {
          items: true,
          order: {
            include: {
              user: true,
              address: true,
              items: {
                include: {
                  store: true,
                }
              }
            }
          }
        }
      });;
      const invoicePdf = await this.pdfService.generateInvoicePdf(invoice);
      const fileName = `invoice-${invoice.invoiceNumber}`;
      const fileUrl = await this.uploadService.uploadPdf(invoicePdf, fileName);
      
      await this.prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          pdfUrl: fileUrl,
        }
      });
      
      return {
        pdfUrl: fileUrl,
        invoiceNumber: invoice.invoiceNumber
      };
    }
    
  }

  findAll() {
    return `This action returns all invoice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoice`;
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
