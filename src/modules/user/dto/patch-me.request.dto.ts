import { IsString } from 'class-validator';

export class PatchMeRequestDto {
  @IsString()
    username: string;
}
