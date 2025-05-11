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
      const vatRate = parseFloat(createProductDto.vatRate.toString()) / 100;
      const price = parseFloat(createProductDto.price.toString());
      const vatAmount = price * vatRate;
      const priceWithVat = parseFloat((price + vatAmount).toFixed(2));
      
      return this.prisma.product.create({
        data: {
          ...productData,
          vatPrice: priceWithVat,
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
            create: variants.map(variant => {
              const varPrice = parseFloat(variant.price.toString());
              const varVatAmount = varPrice * vatRate;
              const varPriceWithVat = parseFloat((varPrice + varVatAmount).toFixed(2));
              
              return {
                name: variant.name,
                sku: variant.sku,
                price: varPrice,
                vatPrice: varPriceWithVat,
                stock: variant.stock,
                imageUrl: variant.imageUrl
              };
            })
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
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
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
  
      const where: any = {isActive:true, deletedAt: null};
  
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
      
      // Fiyat değerlerini number'a dönüştür
      const transformedItems = items.map(item => {
        return {
          ...item,
          price: item.price ? parseFloat(item.price.toString()) : null,
          vatPrice: item.vatPrice ? parseFloat(item.vatPrice.toString()) : null,
          // Varyantların fiyatlarını da dönüştür
          variants: item.variants ? item.variants.map(variant => ({
            ...variant,
            price: variant.price ? parseFloat(variant.price.toString()) : null
          })) : []
        };
      });
      
      // Return paginated result with transformed prices
      return {
        items: transformedItems,
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

  async findOne(id: string, userID?: string ) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          attributes: true,
          brand:true,
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              vatPrice: true,
              imageUrl: true,
            },
          },
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
          },
          OrderItem:{
            where:{
              Review:{
                isNot:null
              }
            },
            select:{
              Review: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  imageUrls: true,
                  createdAt: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!product) return null;
      if(product.isActive === false || product.deletedAt !== null) return null;
      let isFavorited = false;
      if(userID){
        const favorite = await this.prisma.favorite.findFirst({
          where:{
            userId: userID,
            productId: id
          }
        })
        isFavorited = !!favorite
      }
      const reviews = product.OrderItem 
      ? product.OrderItem
          .filter(item => item && item.Review !== null)
          .map(item => item.Review)
      : [];
      const { stock, OrderItem, ...productWithoutStockAndOrderItem } = product;
    
      return {
        ...productWithoutStockAndOrderItem,
        isFavorited,
        reviews,
        price: product.price ? parseFloat(product.price.toString()) : null,
        variants: product.variants ? product.variants.map(variant => ({
          ...variant,
          price: variant.vatPrice ? parseFloat(variant.vatPrice.toString()) : null
        })) : []
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    console.log('updateProductDto', updateProductDto);
    try {
      const { price, vatRate, attributes, ...restData } = updateProductDto;
      
      let dataToUpdate: any = { ...restData };
      
      // Handle attributes if they exist
      if (attributes) {
        // Parse attributes if they're a string (from FormData)
        const parsedAttributes = typeof attributes === 'string' 
          ? JSON.parse(attributes)
          : attributes;
          
        // First delete existing attributes
        await this.prisma.productAttribute.deleteMany({
          where: { productId: id }
        });
        
        // Then add attributes in Prisma's expected format
        dataToUpdate.attributes = {
          create: parsedAttributes.map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        };
      }
      
      if (price !== undefined && vatRate !== undefined) {
        const parsedPrice = parseFloat(price.toString());
        const parsedVatRate = parseFloat(vatRate.toString());
        
        const vatAmount = parsedPrice * (parsedVatRate / 100);
        const priceWithVat = parseFloat((parsedPrice + vatAmount).toFixed(2));
  
        dataToUpdate = {
          ...dataToUpdate,
          price: parsedPrice,
          vatRate: parsedVatRate,
          vatPrice: priceWithVat
        };
      } else if (price !== undefined) {
        const product = await this.prisma.product.findUnique({
          where: { id },
          select: { vatRate: true }
        });
        
        if (product) {
          const parsedPrice = parseFloat(price.toString());
          const vatAmount = parsedPrice * (parseFloat(product.vatRate.toString()) / 100);
          const priceWithVat = parseFloat((parsedPrice + vatAmount).toFixed(2));
          
          dataToUpdate = {
            ...dataToUpdate,
            price: parsedPrice,
            vatPrice: priceWithVat
          };
        }
      } else if (vatRate !== undefined) {
        const product = await this.prisma.product.findUnique({
          where: { id },
          select: { price: true }
        });
        
        if (product) {
          const parsedVatRate = parseFloat(vatRate.toString());
          const parsedPrice = parseFloat(product.price.toString());
          const vatAmount = parsedPrice * (parsedVatRate / 100);
          const priceWithVat = parseFloat((parsedPrice + vatAmount).toFixed(2));
          
          dataToUpdate = {
            ...dataToUpdate,
            vatRate: parsedVatRate,
            vatPrice: priceWithVat
          };
        }
      }
      
      return this.prisma.product.update({
        where: { id },
        data: {
          ...dataToUpdate,
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
          store: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async search(searchParams) {
    try {
      const {
        q,
        categories,
        brands,
        min_price,
        max_price,
        sort = 'newest',
        page = 1,
        limit = 24
      } = searchParams;
  
      // Filtreleme için where nesnesi oluştur
      const where: any = { isActive: true, deletedAt: null };
  
      // Arama sorgusu
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ];
      }
  
      // Kategori filtresi
      if (categories) {
        const categoryIds = Array.isArray(categories) ? categories : [categories];
        where.categories = {
          some: {
            categoryId: { in: categoryIds }
          }
        };
      }
  
      // Marka filtresi
      if (brands) {
        const brandIds = Array.isArray(brands) ? brands : [brands];
        where.brandId = { in: brandIds };
      }
  
      // Fiyat aralığı filtresi
      if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price.gte = parseFloat(min_price);
        if (max_price) where.price.lte = parseFloat(max_price);
      }
  
      // Sıralama seçenekleri
      let orderBy: any = {};
      switch (sort) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'popular':
          orderBy = { salesCount: 'desc' };
          break;
        case 'rating':
          orderBy = { averageRating: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
  
      // Sayfalama için hesaplamalar
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
  
      // Ürünleri ve toplam sayısını al
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip,
          take,
          include: {
            variants: true,
            attributes: true,
            brand: {
              select: {
                id: true,
                name: true,
              }
            },
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            store: {
              select: {
                id: true,
                name: true,
              }
            },
            images: true,
            OrderItem: {
              where: {
                Review: { isNot: null }
              },
              select: {
                Review: {
                  select: {
                    rating: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.product.count({ where })
      ]);
  
      // Fiyat değerlerini ve değerlendirme bilgilerini formatlayarak ürünleri dönüştür
      const transformedProducts = products.map(product => {
        // Değerlendirme ortalamasını hesapla
        const reviews = product.OrderItem?.map(item => item.Review) || [];
        const ratings = reviews.filter(r => r !== null).map(r => r.rating);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
  
        // OrderItem kaldır ve diğer alanları dönüştür
        const { OrderItem, ...productData } = product;
  
        return {
          ...productData,
          price: product.price ? parseFloat(product.price.toString()) : null,
          vatPrice: product.vatPrice ? parseFloat(product.vatPrice.toString()) : null,
          rating: averageRating,
          reviewCount: ratings.length,
          variants: product.variants ? product.variants.map(variant => ({
            ...variant,
            price: variant.price ? parseFloat(variant.price.toString()) : null,
            vatPrice: variant.vatPrice ? parseFloat(variant.vatPrice.toString()) : null
          })) : []
        };
      });
  
      // Kategori ve marka filtrelerini getir
      const availableCategories = await this.prisma.category.findMany({
        where: {
          products: {
            some: {
              product: {
                isActive: true,
                deletedAt: null,
                ...(q ? {
                  OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                  ]
                } : {})
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });
  
      const availableBrands = await this.prisma.brand.findMany({
        where: {
          products: {
            some: {
              isActive: true,
              deletedAt: null,
              ...(q ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } }
                ]
              } : {})
            }
          }
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });
  
      // Fiyat aralığını bul
      const priceStats = await this.prisma.product.aggregate({
        where: {
          isActive: true,
          deletedAt: null,
          ...(q ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          } : {})
        },
        _min: { price: true },
        _max: { price: true },
        _avg: { price: true }
      });
  
      // Sonuçları döndür
      return {
        products: transformedProducts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        },
        availableFilters: {
          categories: availableCategories.map(cat => ({
            _id: cat.id,
            name: cat.name,
            count: cat._count.products
          })),
          brands: availableBrands.map(brand => ({
            _id: brand.id,
            name: brand.name,
            count: brand._count.products
          })),
          priceRange: {
            min: priceStats._min.price ? parseFloat(priceStats._min.price.toString()) : 0,
            max: priceStats._max.price ? parseFloat(priceStats._max.price.toString()) : 0,
            avg: priceStats._avg.price ? parseFloat(priceStats._avg.price.toString()) : 0
          }
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}
