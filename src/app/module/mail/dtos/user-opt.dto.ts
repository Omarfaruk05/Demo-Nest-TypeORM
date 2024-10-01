import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserOTP {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
