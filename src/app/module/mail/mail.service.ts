import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(
    /**
     * Inject mailerService
     */
    private mailerService: MailerService,
  ) {}

  // Service Functions starts here
  public async sendOtp(user: User): Promise<void> {
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify OTP',
      template: './sendOTP',
      context: {
        name: user?.name,
        email: user.email,
        token: token,
      },
    });
  }
}
