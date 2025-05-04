import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, updateStoreApplicationDto, UpdateUserDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common/decorators';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_USERS)
  getAllUsers(){
    return this.adminService.getAllUsers();
  }
  @Patch('users/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_USER)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }
  @Delete('users/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_USER)
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  @Get('stores')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_STORES)
  getAllStores(){
    return this.adminService.getAllStores();
  }
  @Get('stores/applications')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_STORES)
  getAllStoreApplications(){
    return this.adminService.getAllStoreApplications();
  }
  @Put('stores/applications/:id/status')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_STORE)
  updateStoreApplication(@Param('id') id: string, @Body() updateStoreDto: updateStoreApplicationDto) {
    return this.adminService.updateStoreApplication(id, updateStoreDto);
  }

  @Get('products')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_STORES)
  getAllProducts(){
    return this.adminService.getAllProducts();
  }

  @Get('orders')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_ORDERS)
  getAllOrders(){
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_ORDERS)
  getOrderById(@Param('id') id: string){
    return this.adminService.getOrderById(id);
  }

  @Get('categories')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_CATEGORIES)
  getAllCategories(){
        return this.adminService.getAllCategories();
  }

  @Get('brands')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_BRANDS)
  getAllBrands(){
    return this.adminService.getAllBrands();
  }

  @Get('invoices')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_ORDERS)
  getAllInvoices(){
    return this.adminService.getAllInvoices();
  }
}
