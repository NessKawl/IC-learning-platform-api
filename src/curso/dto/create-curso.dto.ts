import { IsEmail, IsString, IsInt } from 'class-validator';

export class createCursoDto {

    @IsString()
    cur_titulo!: string

    @IsString()
    cur_descricao!: string

    @IsInt()
    professor_id!: number
}
