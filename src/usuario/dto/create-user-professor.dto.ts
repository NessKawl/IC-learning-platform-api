import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserProfessorDto {
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
  @IsString()
  usu_curriculo?: string;

  @IsOptional()
  @IsString()
  usu_lattes?: string;

  @IsOptional()
  tiu_id?: number;
}