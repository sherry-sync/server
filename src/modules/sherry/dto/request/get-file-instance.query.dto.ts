import { IsString } from 'class-validator';

export class GetFileInstanceQueryDto {
  @IsString()
    path: string;
}
