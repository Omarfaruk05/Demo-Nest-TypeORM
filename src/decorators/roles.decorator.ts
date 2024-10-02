import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from 'src/common/constants/user.constant';
import { ENUM_ROLES } from 'src/common/enums/user.enum';

export const Roles = (...roles: ENUM_ROLES[]) => SetMetadata(ROLES_KEY, roles);
