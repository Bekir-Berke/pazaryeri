import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode } from '@nestjs/common';
import { CartService } from './cart.service';
import { addToCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('')
  @UseGuards(AuthGuard)
  addToCart(@Req() req: Request, @Body() addToCartDto: addToCartDto) {
    const userId = req['user'].sub;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findCart(@Req() req: Request) {
    const userId = req['user'].sub;
    return this.cartService.findOne(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Req() req: Request, @Body() body:any) {
    const userId = req['user'].sub;
    return this.cartService.remove(userId, body.productId, body.variantId);
  }
}
