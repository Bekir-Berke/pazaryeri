import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { PrismaModule } from 'src/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from 'src/address/address.module';

@Module({
  imports: [PrismaModule, UsersModule, JwtModule.register({
    global: true,
    secret: process.env.JWT_SECRET,
  }),
  AddressModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
