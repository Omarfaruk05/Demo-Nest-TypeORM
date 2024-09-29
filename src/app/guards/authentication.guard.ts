import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { REQUEST_USER_KEY, ROLES_KEY } from '../common/constants/user.constant';
import { ENUM_ROLES } from '../common/enums/user.enum';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    // Authentication: Verify the JWT token
    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          this.jwtConfiguration,
        );
        // Attach the payload to the request
        request[REQUEST_USER_KEY] = payload;
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token.');
      }
    }

    // Role-based authorization: Check for required roles
    const requiredRoles = this.reflector.getAllAndOverride<ENUM_ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If roles are defined, ensure the user is authenticated and has the required roles
    if (requiredRoles?.length > 0) {
      const user = request[REQUEST_USER_KEY];
      if (!user) {
        throw new UnauthorizedException(
          'Authentication required for this route.',
        );
      }

      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new ForbiddenException('You do not have the required role.');
      }
    }

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
