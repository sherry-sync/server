import { IsEnum } from 'class-validator';

import { SherryPermission, SherryPermissionAction } from '@shared/enums';

export class UpdateSherryPermissionDto {
  @IsEnum(SherryPermission)
    role: SherryPermission;

  @IsEnum(SherryPermissionAction)
    action: SherryPermissionAction;
}
