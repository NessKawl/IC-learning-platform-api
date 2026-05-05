import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  usu_nome!: string;

  @IsEmail()
  @IsNotEmpty()
  usu_email!: string;

  @IsString()
  @MinLength(6)
  usu_senha!: string;

  @IsInt()
  tiu_id!: number;
}