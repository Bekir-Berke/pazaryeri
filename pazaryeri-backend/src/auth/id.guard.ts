import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IDGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    const requestedUserId = context.switchToHttp().getRequest().params.id;
    return user.sub === requestedUserId;
  }
}