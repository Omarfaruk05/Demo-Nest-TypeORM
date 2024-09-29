import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from '../common/constants/user.constant';
import { User } from '../module/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    /**
     * Inject reflector
     */
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request[REQUEST_USER_KEY];

    if (!user || !roles.includes(user?.role)) {
      throw new ForbiddenException('You do not have the required role.');
    }
    return true;
  }
}
