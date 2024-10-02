import { Body, Controller, Post } from '@nestjs/common';
import { UserOTPDto } from './dtos/user-opt.dto';
import { ApiQuery } from '@nestjs/swagger';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(
    /**
     * Inject mailService
     */
    private readonly mailService: MailService,
  ) {}
  // verify otp route
  @Post('/verifyOTP')
  public verifyOTP(@Body() userOTPDto: UserOTPDto) {
    return this.mailService.verifyOTP(userOTPDto);
  }

  // resend otp route
  @Post('/resend-otp')
  public resendOTP(
    @Body() { userId, email }: { userId: number; email: string },
  ) {
    return this.mailService.resendOTP(userId, email);
  }
}
