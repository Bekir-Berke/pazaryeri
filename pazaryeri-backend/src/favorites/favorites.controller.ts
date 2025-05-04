import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.CREATE_FAVORITE)
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.favoritesService.create(userId, createFavoriteDto);
  }

  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoritesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFavoriteDto: UpdateFavoriteDto) {
    return this.favoritesService.update(+id, updateFavoriteDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard,PermissionsGuard)
  @Permissions(Permission.DELETE_FAVORITE)
  remove(@Param('id') id: string, @Req() req:Request) {
    const userId = req['user'].sub;
    return this.favoritesService.remove(userId, id);
  }
}
