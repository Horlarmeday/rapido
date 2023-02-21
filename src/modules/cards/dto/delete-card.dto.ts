import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCardDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;
}
