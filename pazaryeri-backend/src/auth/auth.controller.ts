import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req, Headers, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response,Request } from 'express';


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
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(loginDto);
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  @Post('admin-login')
  @HttpCode(200)
  async adminLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.adminLogin(loginDto);
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
  @Post('admin-logout')
  @HttpCode(200)
  async adminLogout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    await this.authService.adminLogout(refreshToken).then(() => {
      response.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.status(200).send({
        message: 'Çıkış yapıldı'
      });
    }
    ).catch((err) => {
      console.log(err);
    });
  }

  @Get('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      response.status(401).send({
        message: 'Refresh token bulunamadı'
      });
      return;
    }
    
    try {
      const result = await this.authService.refresh(refreshToken);
      
      // Burada access_token direkt string olarak alınmalı
      const access_token = result.access_token;
      
      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
      
      return { success: true };
    } catch (error) {
      response.status(401).send({
        message: 'Refresh token geçersiz'
      });
    }
  }

  @Post('store-login')
  @HttpCode(200)
  async storeLogin(@Body() storeLoginDto: StoreLoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.storeLogin(storeLoginDto);
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    await this.authService.logout(refreshToken).then(() => {
      response.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.status(200).send({
        message: 'Çıkış yapıldı'
      });
    }
    ).catch((err) => {
      console.log(err);
    });
  }
  @Post('store-logout')
  @HttpCode(200)
  async storeLogout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    await this.authService.storeLogout(refreshToken).then(() => {
      response.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict'
      });
      response.status(200).send({
        message: 'Çıkış yapıldı'
      });
    }
    ).catch((err) => {
      console.log(err);
    });
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  changePassword(@Req() req:Request, @Body() changePasswordDto:ChangePasswordDto) {
    const userId = req['user'].sub;
    console.log(changePasswordDto)
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  getMe(@Req() req:Request) {
    if (req['user'].isGuest) {
      return {
        isLoggedIn: false,
        message: 'Kullanıcı giriş yapmamış'
      };
    }
    
    const userId = req['user'].sub;
    return this.authService.getMe(userId);
  }
}
