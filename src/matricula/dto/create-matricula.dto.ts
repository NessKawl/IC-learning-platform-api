import { IsInt } from 'class-validator';

export class CreateMatriculaDto {
    @IsInt()
    cur_id!: number;
}