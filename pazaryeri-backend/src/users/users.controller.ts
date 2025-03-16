import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { IDGuard } from 'src/auth/id.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { Permission } from 'src/auth/permissions.enum';
import { PermissionsGuard } from 'src/auth/permissions.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_ALL_USERS)
  findAll() {
    return this.usersService.findAll();
  }
  @Get('profile')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_PROFILE)
  getProfile(@Req() req: Request) {
    const userId = req['user'].sub
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_PROFILE)
  updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req['user'].sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_ANY_USER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_ANY_USER)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.DELETE_ANY_USER)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
