import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserOTPDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
