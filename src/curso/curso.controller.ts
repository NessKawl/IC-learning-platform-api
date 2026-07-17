import {
    Body,
    Controller,
    Get,
    Patch,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CursoService } from './curso.service.js';
import { createCursoDto } from './dto/create-curso.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt.guards.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('curso')
export class CursoController {

    constructor(
        private readonly cursoService:
            CursoService
    ) { }

    @Post('register')
    @UseGuards(
        JwtAuthGuard
    )
    @UseInterceptors(
        FileInterceptor('file')
    )
    async createCurso(
        @UploadedFile()
        file: Express.Multer.File,

        @Body()
        data: createCursoDto,

        @CurrentUser()
        user: any
    ) {

        return this.cursoService
            .createCurso(
                data,
                file,
                user.usu_id
            );
    }

    @Get('all')
    async findAllCursos() {

        return this.cursoService
            .findAllCursos();
    }

    @Get('por-usuario/me')
    @UseGuards(
        JwtAuthGuard
    )
    async getCursosPorUsuario(
        @CurrentUser()
        user: any
    ) {

        return this.cursoService
            .getCursosPorUsuario(
                user.usu_id
            );
    }

    @Get('pendentes')
    @UseGuards(
        JwtAuthGuard
    )
    async getCursosPendentes() {

        return this.cursoService
            .getCursosPendentes();
    }

    @Patch(
        'aprovar/:id'
    )
    @UseGuards(
        JwtAuthGuard
    )
    async aprovarCurso(
        @Param(
            'id',
            ParseIntPipe
        )
        id: number
    ) {

        return this.cursoService
            .aprovarCurso(
                id
            );
    }

    @Patch(
        'rejeitar/:id'
    )
    @UseGuards(
        JwtAuthGuard
    )
    async rejeitarCurso(
        @Param(
            'id',
            ParseIntPipe
        )
        id: number
    ) {

        return this.cursoService
            .rejeitarCurso(
                id
            );
    }

    // SEMPRE DEIXAR POR ÚLTIMO
    @Get(':id')
    async findCursoById(
        @Param(
            'id',
            ParseIntPipe
        )
        id: number
    ) {

        return this.cursoService
            .findCursoById(
                id
            );
    }
}