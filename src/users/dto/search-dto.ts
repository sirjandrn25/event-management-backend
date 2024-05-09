import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  search: string;
}
