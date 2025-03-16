import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService, private uploadService:UploadService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { 
        images, 
        attributes, 
        variants, 
        categories,
        ...productData 
      } = createProductDto;
      return this.prisma.product.create({
        data: {
          ...productData,
          images: images && images.length > 0 ? {
            create: images.map(image => ({
              url: image.url
            }))
          } : undefined,
          
          attributes: attributes && attributes.length > 0 ? {
            create: attributes.map(attr => ({
              name: attr.name,
              value: attr.value
            }))
          } : undefined,
          
          variants: variants && variants.length > 0 ? {
            create: variants.map(variant => ({
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              imageUrl: variant.imageUrl
            }))
          } : undefined,
          
          categories: {
            create: categories.map(category => ({
              category: {
                connect: { id: category.categoryId }
              }
            }))
          }
        },
        include: {
          images: true,
          attributes: true,
          variants: true,
          categories: {
            include: {
              category: true
            }
          },
          store:{
            select:{
              id:true,
              name:true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(filters: ProductFilterDto) {
    try {
      const {
        search,
        categoryId,
        brand,
        minPrice,
        maxPrice,
        color,
        size,
        variantName,  // Yeni eklenen
        variantSku,   // Yeni eklenen
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;
  
      // Build where conditions
      const where: any = {};
  
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
  
      if (categoryId) {
        where.categories = {
          some: {
            categoryId: categoryId
          }
        };
      }
  
      if (brand && brand.length > 0) {
        where.brandId = { in: brand };
      }
  
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }
  
      // Ürün öznitelikleri için filtre
      if (color || size) {
        where.attributes = {
          some: {
            OR: []
          }
        };
        
        if (color) {
          where.attributes.some.OR.push({
            AND: [
              { name: 'Renk' },
              { value: { contains: color, mode: 'insensitive' } }
            ]
          });
        }
        
        if (size) {
          where.attributes.some.OR.push({
            AND: [
              { name: 'Boyut' },
              { value: { contains: size, mode: 'insensitive' } }
            ]
          });
        }
      }
      
      // Varyant filtreleri (yeni eklenen)
      if (variantName || variantSku) {
        where.variants = {
          some: {}
        };
        
        if (variantName) {
          where.variants.some.name = { 
            contains: variantName,
            mode: 'insensitive' 
          };
        }
        
        if (variantSku) {
          where.variants.some.sku = { 
            contains: variantSku,
            mode: 'insensitive' 
          };
        }
      }
  
      // Calculate pagination
      const skip = (page - 1) * limit;
      const take = limit;
  
      // Execute query with pagination
      const [items, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            variants: true,
            attributes: true,
            brand:{
              select:{
                id:true,
                name:true
              }
            },
            categories: {
              include: {
                category:{
                  select:{
                    parent:true
                  },
                }
              },
            },
            store:{
              select:{
                id:true,
                name:true
              }
            },
            images: true,
          },
        }),
        this.prisma.product.count({ where }),
      ]);
  
      // Return paginated result
      return {
        items,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: string) {
    try {
      return this.prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          attributes: true,
          variants: true,
          categories: {
            include: {
              category: true
            }
          },
          store:{
            select:{
              id:true,
              name:true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    try {
      return this.prisma.product.update({
        where: { id },
        data: updateProductDto as any,
      });
    } catch (error) {
      throw new Error(error);
      
    }
  }

  remove(id: string) {
    try {
      return this.prisma.product.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
