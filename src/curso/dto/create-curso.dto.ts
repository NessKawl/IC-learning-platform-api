import { IsEmail, IsString, IsInt, IsNumber } from 'class-validator';

export class createCursoDto {

    @IsString()
    cur_titulo!: string

    @IsString()
    cur_descricao!: string

    @IsString()
    cur_capa_url!: string

    @IsString()
    cur_publico!: string

    @IsString()
    cur_n_modulos!: string

    @IsString()
    cur_conteudo_modulos!: string

    @IsString()
    cur_carga_horaria_modulos!: string
    
    @IsString()
    cur_forma_avaliacao!: string
}   
