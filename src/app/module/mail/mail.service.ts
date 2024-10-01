import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserOTP } from './entities/user-otp.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailService {
  constructor(
    /**
     * Inject mailerService
     */
    private mailerService: MailerService,

    /**
     * Inject userOTPRepository
     */
    @InjectRepository(UserOTP)
    private readonly userOTPRepository: Repository<UserOTP>,
  ) {}

  // Service Functions starts here
  public async sendOtp(user: User): Promise<UserOTP> {
    // generate random otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // hash the otp
    const salt = await bcrypt.genSalt();
    const hashedOTP = await bcrypt.hash(otp, salt);

    let newOTPData = this.userOTPRepository.create({
      userId: user.id,
      otp: hashedOTP,
      createDate: Date.now(),
      expiresAt: Date.now() + 6000,
    });

    newOTPData = await this.userOTPRepository.save(newOTPData);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify OTP',
      template: './sendOTP',
      context: {
        name: user?.name,
        email: user.email,
        token: otp,
      },
    });

    return newOTPData;
  }
}
