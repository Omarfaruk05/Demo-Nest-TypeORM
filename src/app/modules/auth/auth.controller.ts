import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { UserOTPDto } from './dtos/user-otp.dot';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  public logOut() {
    // clear cookies

    return {
      message: 'Successfully logged out.',
    };
  }

  @Get('refresh-token')
  @HttpCode(HttpStatus.OK)
  public refreshToken(@Req() req: Request) {
    //get refresh token form cookies
    const refreshToken = req.cookies?.refreshToken as string;

    return this.authService.refreshToken(refreshToken);
  }

  // verify otp route
  @Post('/verifyOTP')
  public verifyOTP(@Body() userOTPDto: UserOTPDto) {
    return this.authService.verifyOTP(userOTPDto);
  }

  // resend otp route
  @Post('/resendOTP')
  public resendOTP(
    @Body() { userId, email }: { userId: number; email: string },
  ) {
    return this.authService.resendOTP(userId, email);
  }
}
