import { IntersectionType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/app/common/pagination/pagination-query.dto';
class GetUsersBaseDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}

export class GetUsersDto extends IntersectionType(
  GetUsersBaseDto,
  PaginationQueryDto,
) {}
