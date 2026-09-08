import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  usu_nome!: string;

  @IsEmail()
  @IsNotEmpty()
  usu_email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12, {
    message: 'A senha deve possuir pelo menos 12 caracteres',
  })
  @MaxLength(72, {
    message: 'A senha deve possuir no máximo 72 caracteres',
  })
  usu_senha!: string;

  @IsOptional()
  @IsString()
  usu_proposta?: string;

  @IsOptional()
  @IsString()
  usu_status?: string;

  @IsOptional()
  tiu_id?: number;
}