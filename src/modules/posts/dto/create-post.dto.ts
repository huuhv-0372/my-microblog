import { IsString, IsArray, IsInt, ArrayMinSize, MaxLength, MinLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return [Number(value)];
    return [];
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  tagIds!: number[];

  @IsIn(['save_draft', 'submit_review'])
  action!: string;
}
