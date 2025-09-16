import { IsNotEmpty } from 'class-validator';

export class SetCacheDto {
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  value: string;
}
