import { IsEmail, IsString, IsInt } from 'class-validator';

export class CreateMaterialDto {
    @IsString()
    mat_titulo!: string

    @IsString()
    mat_url!: string

    @IsInt()
    mat_ordem!: number

    @IsInt()
    mod_id!: number

    @IsInt()
    tim_id!: number
}