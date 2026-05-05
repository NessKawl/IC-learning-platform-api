import { IsInt, IsString } from "class-validator";

export class CreateModuloDto {

    @IsString()
    mod_titulo!: string

    @IsString()
    mod_descricao!: string

    @IsInt()
    cur_id!: number

}