import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto, UpdateProductDto, updateStoreApplicationDto, UpdateUserDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common/decorators';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { UpdateStoreDto } from 'src/store/dto/update-store.dto';
import { UpdateBrandDto } from 'src/brand/dto/update-brand.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateBrandDto } from 'src/brand/dto/create-brand.dto';

@SkipThrottle()
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
  @Delete('stores/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_STORE)
  removeStore(@Param('id') id: string) {
    return this.adminService.removeStore(id);
  }
  @Put('stores/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_STORE)
  updateStore(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.adminService.updateStore(id, updateStoreDto);
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
  @Delete('products/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_STORE)
  removeProduct(@Param('id') id: string) {
    return this.adminService.removeProduct(id);
  }
  @Put('products/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_STORE)
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.adminService.updateProduct(id, updateProductDto);
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
  @Post('brands')
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.CREATE_BRAND)
  createBrand(@Body() createBrandDto:CreateBrandDto){
    return this.adminService.addBrand(createBrandDto)
  }

  @Patch('brands/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_BRAND)
  updateBrand(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.adminService.updateBrand(id, updateBrandDto);
  }


  @Delete('brands/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_BRAND)
  removeBrand(@Param('id') id: string) {
    return this.adminService.removeBrand(id);
  }

  @Get('invoices')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_ORDERS)
  getAllInvoices(){
    return this.adminService.getAllInvoices();
  }
  @Get('coupons')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_ALL_COUPONS)
  getAllCoupons(){
    return this.adminService.getAllCoupons();
  }
}
