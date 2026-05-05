import { Body, Controller, Get, Post } from '@nestjs/common';
import { CursoService } from './curso.service.js';
import { createCursoDto } from './dto/create-curso.dto.js';

@Controller('curso')
export class CursoController {

    constructor(private readonly cursoService: CursoService) { }

    @Get('all')
    async findAllCursos() {
        return this.cursoService.findAllCursos()
    }

    @Post('register')
    async createCurso(@Body() data: createCursoDto) {
        return this.cursoService.createCurso(data)
    }
}