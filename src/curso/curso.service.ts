import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createCursoDto } from './dto/create-curso.dto.js';

@Injectable()
export class CursoService {

    constructor(private readonly prismaService: PrismaService) { }

    async createCurso(data: createCursoDto) {
        return this.prismaService.cur_curso.create({
            data,
        })
    }

    async findAllCursos() {
        return this.prismaService.cur_curso.findMany()
    }
}
