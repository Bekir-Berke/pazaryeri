import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, updateStoreApplicationDto, UpdateUserDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma:PrismaService) {}
  getAllUsers(){
    return this.prisma.user.findMany({
      select:{
        id:true,
        firstName:true,
        lastName:true,
        isActive:true,
        email:true,
        createdAt:true,
        deletedAt:true,
        role:true
      }
    });
  }
  updateUser(id:string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: id
      },
      data: {
        ...updateUserDto
      }
    });
  }
  removeUser(id:string) {
    return this.prisma.user.update({
      where: {
        id: id
      },data:{
        deletedAt: new Date()
      }
    });
  }
  getAllStores(){
    return this.prisma.store.findMany({ include: { companyType: true, products: true } });
  }
  getAllStoreApplications(){
    return this.prisma.store.findMany({where:{status:'PENDING'}})
  }
  updateStoreApplication(id:string, updateStoreDto: updateStoreApplicationDto) {
    return this.prisma.store.update({
      where: {
        id: id
      },
      data: {
        status: updateStoreDto.status
      }
    });
  }
  getAllProducts(){
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        vatRate: true,
        vatPrice:true,
        price: true,
        stock:true,
        sku:true,
        barcode:true,
        isActive:true,
        imageUrl:true,
        description: true,
        createdAt: true,
        updatedAt: true,
        store:{
          select:{
            id:true,
            name:true
          },
        },
        brand:{
          select:{
            id:true,
            name:true,
          }
        },
      }
    })
  }
  getAllOrders(){
    return this.prisma.order.findMany({
      include: {
        user:true,
        address: true,
        invoices: true,
        items:{
          include:{
            store:true
          }
        }
      }
    })
  }
  getOrderById(id:string){
    return this.prisma.order.findUnique({
      where: {
        id: id
      },
      include: {
        user:true,
        address: true,
        invoices: true,
        items:{
          include:{
            product:true,
            store:true
          }
        }
      }
    })
  }
  getAllCategories(){
    return this.prisma.category.findMany({})
  }
  getAllBrands(){
    return this.prisma.brand.findMany({
      select:{
        id:true,
        name:true,
        _count:{
          select:{
            products:true
          }
        }
      }
    })
  }
  getAllInvoices(){
    return this.prisma.invoice.findMany({
      select:{
        id:true,
        orderId:true,
        invoiceNumber:true,
        issuedAt:true,
        amount:true,
        taxAmount:true,
        pdfUrl:true,
        order:{
          select:{
            address:true,
            user:{
              select:{
                id:true,
                firstName:true,
                lastName:true,
              }
            }
          }
        },
        items:{
          select:{
            id:true,
            description:true,
            unitPrice:true,
            quantity:true,
            totalPrice:true,
            taxAmount:true,
            vatRate:true,
          }
        }
      }
    })
  }
}
