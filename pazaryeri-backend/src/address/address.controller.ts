import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { IDGuard } from 'src/auth/id.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/user/:userId')
  @UseGuards(AuthGuard,IDGuard)
  findAll(@Param ('userId') userId:string) {
    return this.addressService.findUserAllAddresses(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Post('/user/:userId')
  @UseGuards(AuthGuard,IDGuard)
  create(@Param('userId') id: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(id, createAddressDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Patch(':id/set-default')
  @UseGuards(AuthGuard)
  setDefault(@Param ('userId') userId:string, @Param('id') id: string) {
    return this.addressService.setDefault(userId, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param ('userId') userId:string, @Param('id') id: string) {
    return this.addressService.remove(userId, id);
  }
}
