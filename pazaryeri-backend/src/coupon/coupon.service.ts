import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from '../prisma.service';
import { Coupon,  } from '@prisma/client';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}
  isCouponActiveNow(coupon: Coupon): boolean {
    console.log(new Date().toISOString());
    const now = new Date();

    return coupon.isActive && now >= coupon.startDate && now <= coupon.endDate;
  }
  checkCouponUsageLimit(coupon: Coupon): boolean {
    return coupon.usedCount != coupon.usageLimit;
  }
  async checkUserUsedCoupon(coupon: Coupon, userId: string): Promise<boolean> {
    if (coupon.perUserLimit && coupon.perUserLimit > 0) {
      const usageHistory = await this.prisma.couponUsageHistory.findMany({
        where: {
          couponId: coupon.id,
        },
      });
      return usageHistory.filter(history => history.userId === userId).length >= coupon.perUserLimit;
    }
    return false;
  }
  async validate(userId: string, couponCode: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode },
      include: {
        users: true,
        usageHistory: true,
        categories: true,
        products: true,
        store: true,
      },
    });

    if (!coupon) {
      throw new BadRequestException('Kupon bulunamadı');
    }

    if (coupon.deletedAt) {
      throw new BadRequestException('Kupon aktif değil');
    }

    if (!this.isCouponActiveNow(coupon)) {
      throw new BadRequestException('Kupon süresi dolmuş veya aktif değil');
    }

    if (!this.checkCouponUsageLimit(coupon)) {
      throw new BadRequestException('Kupon kullanım limiti dolmuş');
    }

    if (await this.checkUserUsedCoupon(coupon, userId)) {
      throw new BadRequestException('Bu kuponu kullanma yetkiniz doldu');
    }
    if (coupon.users && coupon.users.length > 0) {
      const isUserAllowed = coupon.users.some((user) => user.userId === userId);
      if (!isUserAllowed) {
        throw new BadRequestException('Bu kuponu kullanma yetkiniz yok');
      }
    }

    // Kullanıcının sepetini al
    const userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                categories: {
                  include: {
                    category: {
                      include: { parent: true },
                    },
                  },
                },
                store: true,
              },
            },
          },
        },
      },
    });

    if (!userCart || userCart.items.length === 0) {
      throw new BadRequestException('Sepet boş veya bulunamadı');
    }

    let eligibleItems = [...userCart.items];

    if (coupon.storeId) {
      eligibleItems = eligibleItems.filter(
        (item) => item.product.storeId === coupon.storeId,
      );

      if (eligibleItems.length === 0) {
        throw new BadRequestException(
          'Bu kupon, sepetinizdeki hiçbir mağaza ürünü için geçerli değil',
        );
      }
    }

    if (coupon.categories && coupon.categories.length > 0) {
      const categoryIds = coupon.categories.map((c) => c.categoryId);

      eligibleItems = eligibleItems.filter((item) => {
        const productCategories = item.product.categories.map(
          (pc) => pc.category,
        );

        return productCategories.some((category) => {
          if (categoryIds.includes(category.id)) return true;
          if (category.parent && categoryIds.includes(category.parent.id))
            return true;
          return false;
        });
      });

      if (eligibleItems.length === 0) {
        throw new BadRequestException(
          'Bu kupon, sepetinizdeki hiçbir kategori için geçerli değil',
        );
      }
    }

    if (coupon.products && coupon.products.length > 0) {
      const productIds = coupon.products.map((p) => p.productId);

      eligibleItems = eligibleItems.filter((item) =>
        productIds.includes(item.productId),
      );

      if (eligibleItems.length === 0) {
        throw new BadRequestException(
          'Bu kupon, sepetinizdeki hiçbir ürün için geçerli değil',
        );
      }
    }

    if (coupon.minOrderAmount) {
      const eligibleTotal = eligibleItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      );

      if (eligibleTotal < Number(coupon.minOrderAmount)) {
        throw new BadRequestException('Sepet tutarı yetersiz');
      }
    }
    return {
      valid: true,
      id: coupon.id,
      type: coupon.type,
      value: Number(coupon.value),
      desc: coupon.description,
      storeId: coupon.storeId,
      eligibleItemIds: eligibleItems.map((item) => item.productId),
      categoryIds:
        coupon.categories?.length > 0
          ? coupon.categories.map((c) => c.categoryId)
          : undefined,
      productIds:
        coupon.products?.length > 0
          ? coupon.products.map((p) => p.productId)
          : undefined,
    };
  }
  async recordUsage(
    couponId: string,
    userId: string,
    orderId: string,
    amount: number,
  ) {
    await this.prisma.couponUsageHistory.create({
      data: {
        couponId,
        userId,
        orderId,
        amount,
      },
    });

    await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }
  async create(createCouponDto: CreateCouponDto, userId: string) {
    console.log(createCouponDto);
    if (createCouponDto.startDate > createCouponDto.endDate) {
      throw new BadRequestException(
        'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
      );
    }
    const coupon = await this.prisma.coupon.create({
      data: {
        code: createCouponDto.code,
        type: createCouponDto.type,
        value: createCouponDto.value,
        minOrderAmount: createCouponDto.minOrderAmount,
        maxDiscount: createCouponDto.maxDiscount,
        startDate: createCouponDto.startDate,
        endDate: createCouponDto.endDate,
        usageLimit: createCouponDto.usageLimit,
        perUserLimit: createCouponDto.perUserLimit,
        description: createCouponDto.description,
        isActive: createCouponDto.isActive,
        storeId: userId,
      },
    });
    if (createCouponDto.categoryIds) {
      await this.prisma.couponCategory.createMany({
        data: createCouponDto.categoryIds.map((id) => ({
          couponId: coupon.id,
          categoryId: id,
        })),
      });
    }
    if (createCouponDto.productIds) {
      await this.prisma.couponProduct.createMany({
        data: createCouponDto.productIds.map((id) => ({
          couponId: coupon.id,
          productId: id,
        })),
      });
    }
    return coupon;
  }

  findAll() {
    return `This action returns all coupon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: string, userId: string, updateCouponDto: UpdateCouponDto) {
    return this.prisma.coupon.update({
      where: { id, storeId: userId },
      data: updateCouponDto,
    });
  }

  remove(id: string, userId: string) {
    return this.prisma.coupon.update({
      where: { id, storeId: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
