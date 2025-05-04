import { Injectable } from '@nestjs/common';
import { addToCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }
  async create(userId: string) {
    return this.prisma.cart.create({
      data: {
        userId,
      },
    });
  }
  async addToCart(userId: string, addToCartDto: addToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: addToCartDto.productId,
      },
      include: {
        variants: true
      }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      }
    });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    let price:any = product.vatPrice;
    let variantId = addToCartDto.variantId || null;
    
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: {
          id: variantId,
          productId: product.id
        }
      });
      
      if (!variant) {
        throw new Error('Variant not found for this product');
      }
      
      if (variant.vatPrice !== null && variant.vatPrice !== undefined) {
        price = variant.vatPrice;
      }
      
      if (variant.stock < addToCartDto.quantity) {
        throw new Error('Not enough stock for this variant');
      }
    } else {
      if (product.stock < addToCartDto.quantity) {
        throw new Error('Not enough stock for this product');
      }
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: addToCartDto.productId,
        variantId: variantId
      }
    });
    
    if (existingCartItem) {
      return this.prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + addToCartDto.quantity
        }
      });
    } else {
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          variantId: variantId,
          quantity: addToCartDto.quantity,
          price: price,
        }
      });
    }
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: string) {
    return this.prisma.cart.findFirst({
      where: {
        userId: id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            },
            // Varyant bilgilerini de dahil et
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
                sku: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  async remove(userId: string, productId: string, variantId?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      }
    });
    
    if (!cart) {
      throw new Error('Cart not found');
    }
    // findUnique yerine findFirst kullanarak ürün/varyant kombinasyonunu ara
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        ...(variantId ? { variantId: variantId } : { variantId: null })
      }
    });
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    return this.prisma.cartItem.delete({
      where: {
        id: cartItem.id  // Sepet öğesinin ID'sini kullanarak silme işlemi yap
      }
    });
  }
}
