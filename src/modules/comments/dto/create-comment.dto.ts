import { IsString, MinLength, MaxLength, IsEmail, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  postId!: number;
}
