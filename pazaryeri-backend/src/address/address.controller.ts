import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { IDGuard } from 'src/auth/id.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';

@Controller('/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/user')
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.READ_ANY_ADDRESS)
  findAll(@Req() req:Request) {
    const userId = req['user'].sub;
    return this.addressService.findUserAllAddresses(userId);
  }

  @Post('/user')  
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.CREATE_ADDRESS)
  create(@Body() createAddressDto: CreateAddressDto, @Req() req:Request) {
    const id = req['user'].sub;
    return this.addressService.create(id, createAddressDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_ADDRESS)
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Patch(':id/set-default')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_ADDRESS)
  setDefault(@Req() req:Request, @Param('id') id: string) {
    const userId = req['user'].sub;
    return this.addressService.setDefault(userId, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Req() req:Request, @Param('id') id: string) {
    const userId = req['user'].sub;
    return this.addressService.remove(userId, id);
  }
}
