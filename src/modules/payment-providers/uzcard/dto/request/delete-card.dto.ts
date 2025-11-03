import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class DeleteCardDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsString()
  uzcardUserCardId?: string;
}
