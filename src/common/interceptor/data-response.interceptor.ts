import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Set cookie only for login or refresh-token or verifyOTP route
        if (
          request.path === '/auth/login' ||
          request.path === '/auth/refresh-token' ||
          request.path === '/auth/verifyOTP'
        ) {
          response.cookie('refreshToken', data?.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24, // (1 day in milliseconds)
          });
        }
        if (request.path === '/auth/logout') {
          response.clearCookie('refreshToken');
        }

        return {
          apiVersion: this.configService.get('appConfig.apiVersion'),
          success: true,
          message: 'Operation Successful',
          status: HttpStatus.OK,
          data: data,
        };
      }),
    );
  }
}
