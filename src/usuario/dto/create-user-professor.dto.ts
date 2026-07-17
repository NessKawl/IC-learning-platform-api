import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt } from 'class-validator';
import { isSet } from 'node:util/types';

enum UsuStatus {
  PENDENTE = 'PENDENTE',
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export class CreateUserProfessorDto {
  @IsString()
  @IsNotEmpty()
  usu_nome!: string;

  @IsEmail()
  @IsNotEmpty()
  usu_email!: string;

  @IsString()
  @MinLength(6)
  usu_senha!: string;

  @IsString()
  usu_proposta?: string;

  @IsString()
  usu_status?: UsuStatus;

  @IsString()
  usu_curriculo!: string;

  @IsString()
  usu_lattes?: string;

  @IsInt()
  tiu_id!: number;
}