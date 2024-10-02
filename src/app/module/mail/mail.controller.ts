import { Body, Controller, Post } from '@nestjs/common';
import { UserOTPDto } from './dtos/user-opt.dto';

@Controller('mail')
export class MailController {
  @Post()
  public verifyOTP(@Body() userOTPDto: UserOTPDto) {
    return this.verifyOTP(userOTPDto);
  }
}
