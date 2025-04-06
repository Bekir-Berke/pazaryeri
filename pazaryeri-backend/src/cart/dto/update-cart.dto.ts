import { PartialType } from '@nestjs/swagger';
import { addToCartDto } from './add-cart.dto';

export class UpdateCartDto extends PartialType(addToCartDto) {}
