import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserOTP } from './entities/user-otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserOTPDto } from './dtos/user-opt.dto';
import { UsersService } from '../users/users.service';

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

    /**
     *
     * Inject usersService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
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
      expiresAt: Date.now() + 60000,
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

  // Verify OTP
  public async verifyOTP(userOTPDto: UserOTPDto) {
    // check the userOTPDto exist
    if (!userOTPDto.userId || !userOTPDto.otp) {
      throw new BadRequestException('Empty otp details are not allowed.');
    }

    const userOTPRecords = await this.userOTPRepository.find({
      where: {
        id: userOTPDto.userId,
      },
    });

    if (userOTPRecords.length <= 0) {
      throw new NotFoundException(
        "Account record doesn't exist or has been verified already. Please sign up or login",
      );
    }
    const { expiresAt, otp: hashedOTP } = userOTPRecords[0];

    // check the otp expiration
    if (expiresAt.getTime() < Date.now()) {
      await this.userOTPRepository.delete({
        userId: userOTPDto.userId,
      });
      throw new BadRequestException('Code has expired. Please request again.');
    }

    // Compare the otp
    const validOTP = await bcrypt.compare(userOTPDto.otp, hashedOTP);

    if (!validOTP) {
      throw new BadRequestException('Invalid code passed. Check your inbox');
    }

    // return the user
    const user = await this.usersService.findOne(userOTPDto.userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  // reSendOTP

  public async resendOTP(userId: number, email: string) {
    if (!userId || !email) {
      throw new BadRequestException('Empty otp details are not allowed');
    }

    // find the uer
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException("User doesn't found");
    }

    //delete previous userOTP data form database
    await this.userOTPRepository.delete({ userId });

    //resend otp
    const result = await this.sendOtp(user);
    return result;
  }
}
