import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from './permissions.enum';
import { ROLE_PERMISSIONS } from './role-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('Required Permissions:', requiredPermissions);
    if (!requiredPermissions) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    console.log('User:', user);
    const userPermissions = ROLE_PERMISSIONS[user.role];
    console.log('User Permissions:', userPermissions);
    
    if (!userPermissions) {
      return false;
    }
    
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );
    console.log('Has Permission:', hasPermission);
    return hasPermission;
  }
}