import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingProvider } from './providers/hashing.provider';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    /**
     * Inject hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     *
     * Inject usersService
     */
    private readonly usersService: UsersService,

    /**
     *
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
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
}
