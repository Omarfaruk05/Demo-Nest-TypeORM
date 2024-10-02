import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ENUM_ROLES } from 'src/app/common/enums/user.enum';

export class CreateUserDto {
  /**
   * Name
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  /**
   * Email
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(96)
  email: string;

  /**
   * Password
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(96)
  password: string;

  /**
   * role
   */
  @IsEnum(ENUM_ROLES)
  @IsOptional()
  role?: ENUM_ROLES;

  /**
   * isVerified
   */
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
