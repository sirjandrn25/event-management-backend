import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  @Min(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @IsDate()
  end_time: Date;

  @IsOptional()
  @IsArray()
  participates?: string[];
}
