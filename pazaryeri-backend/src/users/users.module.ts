import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma.module';
import { AddressModule } from '../address/address.module';
import { CartService } from 'src/cart/cart.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AddressModule),

  ],
  controllers: [UsersController],
  providers: [UsersService, CartService],
  exports: [UsersService]
})
export class UsersModule {}