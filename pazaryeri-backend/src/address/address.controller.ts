import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users/:userId/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  findAll(@Param ('userId') userId:string) {
    return this.addressService.findUserAllAddresses(userId);
  }

  @Get(':id')
  findOne(@Param('userId') userId:string, @Param('id') id: string) {
    return this.addressService.findUserOneAddress(userId,id);
  }

  @Post()
  create(@Param('userId') id: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(id, createAddressDto);
  }

  @Patch(':id')
  update(@Param ('userId') userId:string, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Patch(':id/set-default')
  setDefault(@Param ('userId') userId:string, @Param('id') id: string) {
    return this.addressService.setDefault(userId, id);
  }

  @Delete(':id')
  remove(@Param ('userId') userId:string, @Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
