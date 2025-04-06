import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
  @Post('store-login')
  @HttpCode(200)
  storeLogin(@Body() storeLoginDto: StoreLoginDto) {
    return this.authService.storeLogin(storeLoginDto);
  }
  @Post('logout')
  @HttpCode(200)
  logout(@Headers('Authorization') token: string) {
    const refreshToken = token.split(' ')[1];
    return this.authService.logout(refreshToken);
  }
  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  changePassword(@Req() req:Request, @Body() changePasswordDto:ChangePasswordDto) {
    const userId = req['user'].sub;
    console.log(changePasswordDto)
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
