import { Expose } from 'class-transformer';

export class FileTypeResponseDto {
  @Expose()
    fileTypeId: string;

  @Expose()
    type: string;

  @Expose()
    sherryId: string;
}
