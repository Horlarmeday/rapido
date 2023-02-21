import { IsNotEmpty, IsString } from 'class-validator';

export class MakeCardDefaultDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;
}
