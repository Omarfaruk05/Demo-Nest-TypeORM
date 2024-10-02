import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingProvider } from './providers/hashing.provider';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { UserOTPDto } from './dtos/user-otp.dot';
import { Repository } from 'typeorm';
import { UserOTP } from '../mail/entities/user-otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    /**
     * Inject hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject usersService
     */
    private readonly usersService: UsersService,

    /**
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,

    /**
     * Inject mailService
     */
    private readonly mailService: MailService,
  ) {}

  // Functions for controllers

  // login service
  public async login(loginDto: LoginDto) {
    let user = await this.usersService.findOneNyEmail(loginDto.email);

    let isEqual: boolean = false;

    try {
      isEqual = await this.hashingProvider.comparePassword(
        loginDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password');
    }

    return await this.generateTokensProvider.generateTokens(user);
  }

  // refresh token service
  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const userId = await this.generateTokensProvider.gerUserIdByRefreshToken(
      refreshTokenDto.refreshToken,
    );

    try {
      const user = await this.usersService.findOne(userId);

      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  // Verify OTP
  public async verifyOTP(userOTPDto: UserOTPDto) {
    // check the userOTPDto exist
    if (!userOTPDto.userId || !userOTPDto.otp) {
      throw new BadRequestException('Empty otp details are not allowed.');
    }

    // get the userOTP data from database
    const userOTPRecords = await this.mailService.findManyWithId(
      userOTPDto.userId,
    );

    if (userOTPRecords.length <= 0) {
      throw new NotFoundException(
        "Account record doesn't exist or has been verified already. Please sign up or login",
      );
    }
    const { expiresAt, otp: hashedOTP } = userOTPRecords[0];

    // check the otp expiration
    if (expiresAt.getTime() < Date.now()) {
      await this.mailService.delete(userOTPDto.userId);
      throw new BadRequestException('Code has expired. Please request again.');
    }

    // Compare the otp
    const validOTP = await bcrypt.compare(userOTPDto.otp, hashedOTP);

    if (!validOTP) {
      throw new BadRequestException('Invalid code passed. Check your inbox');
    }

    // update the user verification
    const update = await this.usersService.update(userOTPDto.userId, {
      isVerified: true,
    });

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
    // find the user
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException("User doesn't found");
    }

    //delete previous userOTP data form database
    await this.mailService.delete(userId);

    //resend otp
    const result = await this.mailService.sendOtp(user);
    return result;
  }
}
