import { Expose } from 'class-transformer';

import { SherryPermission } from '@shared/enums';

export class PermissionsResponseDto {
  @Expose()
    sherryPermissionId: string;

  @Expose()
    sherryId: string;

  @Expose()
    userId: string;

  @Expose()
    role: SherryPermission;
}
