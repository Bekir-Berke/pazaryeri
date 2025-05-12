import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, updateStoreApplicationDto, UpdateUserDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateStoreDto } from 'src/store/dto/update-store.dto';
import { UpdateProductDto } from './dto/update-admin.dto';
import { UpdateBrandDto } from 'src/brand/dto/update-brand.dto';
import { CreateBrandDto } from 'src/brand/dto/create-brand.dto';

@Injectable()
export class AdminService {
  constructor(private prisma:PrismaService) {}
  getAllUsers(){
    return this.prisma.user.findMany({
      where:{
        deletedAt:null
      },
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
    return this.prisma.store.findMany({
      where:{
        deletedAt:null
      },
      include: { companyType: true, products: true }
    });
  }
  async updateStore(id:string, updateStoreDto: UpdateStoreDto){
    if(updateStoreDto.status === 'APPROVED'){
      await this.prisma.store.update({
        where: {
          id: id
        },
        data: {
          ...updateStoreDto
        }
      });
      await this.prisma.product.updateMany({
        where: {
          storeId: id
        },
        data: {
          isActive: true,
          isFeature:true
        }
      });
    }
    if(updateStoreDto.status === 'SUSPENDED'){
      await this.prisma.store.update({
        where: {
          id: id
        },
        data: {
          ...updateStoreDto
        }
      });
      await this.prisma.product.updateMany({
        where: {
          storeId: id
        },
        data: {
          isActive: false,
          isFeature:false 
        }
      });
    }
    return {
      message: 'Store and products updated successfully'
    };
  }
  async removeStore(id:string){
    await this.prisma.store.update({
      where: {
        id: id
      },
      data: {
        deletedAt: new Date()
      }
    });
    await this.prisma.product.updateMany({
      where: {
        storeId: id
      },
      data: {
        isActive: false,
        isFeature:false
      }
    });
    return {
      message: 'Store and products deleted successfully'
    };
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
      where:{
        deletedAt:null
      },
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
        categories:{
          select:{
            category:{
              select:{
                id:true,
                name:true
              }
            }
          }
        },
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
  updateProduct(id:string, updateProductDto: UpdateProductDto) {
  }
  getAllOrders(){
    return this.prisma.order.findMany({
      where:{
        deletedAt:null
      },
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
        id: id,
        deletedAt:null
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
    return this.prisma.category.findMany({where:{deletedAt:null}})
  }
  getAllBrands(){
    return this.prisma.brand.findMany({
      where:{
        deletedAt:null
      },
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
  addBrand(createBrandDto:CreateBrandDto){
    return this.prisma.brand.create({
      data:createBrandDto
    })
  }
  updateBrand(id:string, updateBrandDto: UpdateBrandDto){
    return this.prisma.brand.update({
      where: { id },
      data: { ...updateBrandDto }
    });
  }
  removeBrand(id:string){
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
  getAllInvoices(){
    return this.prisma.invoice.findMany({
      where:{
        deletedAt:null
      },
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
  getAllCoupons(){
    return this.prisma.coupon.findMany({})
  }
}
