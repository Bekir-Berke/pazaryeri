import { Controller, Req, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }
  
  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Get('dashboard')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(Permission.READ_PROFILE)
  getDashboard(@Req() req: Request) {
    return this.storeService.findOne(req['user'].sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findStoreProfile(id);
  }

  @Get(':id/products')
  findStoreProducts(@Param('id') id: string) {
    return this.storeService.findStoreProducts(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }
}
