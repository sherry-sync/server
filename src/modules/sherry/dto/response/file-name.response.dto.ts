import { Expose } from 'class-transformer';

export class FileNameResponseDto {
  @Expose()
    fileNameId: string;

  @Expose()
    name: string;

  @Expose()
    sherryId: string;
}
