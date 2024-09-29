import { SetMetadata } from '@nestjs/common';
import { ENUM_ROLES } from '../common/enums/user.enum';
import { ROLES_KEY } from '../common/constants/user.constant';

export const Roles = (...roles: ENUM_ROLES[]) => SetMetadata(ROLES_KEY, roles);
