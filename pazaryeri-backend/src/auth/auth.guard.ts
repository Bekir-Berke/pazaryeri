import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }
  private logger = new Logger(AuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const originalUrl = request.originalUrl;
    const path = request.path;
    const baseUrl = request.baseUrl;

    this.logger.log(`İstek: ${method} ${url}`);
    this.logger.verbose(`Detaylı Path: originalUrl=${originalUrl}, path=${path}, baseUrl=${baseUrl}`);
    const extractTokens = this.extractToken(request);

    if (!extractTokens) {
      if (url === '/api/product' || url.startsWith('/api/product') || url === '/api/auth/me') {
        if (url === '/api/auth/me') {
          request['user'] = { isGuest: true };
        }
        return true;
      }
      throw new UnauthorizedException('Token bulunamadı');
    }

    try {
      const payload = await this.jwtService.verifyAsync(extractTokens.access_token, {
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
    } else {
      return false
    }
  }
}
