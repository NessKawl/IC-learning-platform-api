import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CursoService } from './curso.service.js';
import { createCursoDto } from './dto/create-curso.dto.js';

@Controller('curso')
export class CursoController {

    constructor(private readonly cursoService: CursoService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('file'))
    async createCurso(
        @UploadedFile() file: Express.Multer.File,
        @Body() data: createCursoDto
    ) {
        return this.cursoService.createCurso(data, file);
    }

    @Get('all')
    async findAllCursos() {
        return this.cursoService.findAllCursos();
    }

    @Get(':id')
    async findCursoById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.cursoService.findCursoById(id);
    }
}