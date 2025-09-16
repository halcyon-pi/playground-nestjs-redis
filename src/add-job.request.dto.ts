import { IsDefined, IsNotEmpty } from 'class-validator';

export class AddJobDto {
  @IsNotEmpty()
  name: string;

  @IsDefined()
  data: unknown;
}
