import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import e, { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const extractTokens = this.extractToken(request);

    if (!extractTokens) {
      throw new UnauthorizedException('Token bulunamadı');
    }

    try {
      const payload = await this.jwtService.verifyAsync(extractTokens.access_token,{
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException('Token geçersiz');
    }

    return true;
  }

  private extractToken(request: Request) {
    if (request.cookies?.access_token && request.cookies?.refresh_token) {
      return { 
        access_token: request.cookies.access_token,
        refresh_token: request.cookies.refresh_token,
      }
    }else{
      return false
    }
  }
}
