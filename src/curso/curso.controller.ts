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
    BadRequestException,
    Req,
} from '@nestjs/common';

import {
    FileFieldsInterceptor
} from "@nestjs/platform-express";
import { UploadedFiles } from "@nestjs/common";
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

    @Post("register")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            {
                name: "file",
                maxCount: 1,
            },
            {
                name: "conteudoModulo",
                maxCount: 1,
            },
        ]),
    )
    async createCurso(

        @UploadedFiles()
        files: {
            file?: Express.Multer.File[];
            conteudoModulo?: Express.Multer.File[];
        },

        @Body()
        data: createCursoDto,

        @CurrentUser()
        user: any,
    ) {
        if (!files.file?.length) {
            throw new BadRequestException("A capa é obrigatória");
        }

        if (!files.conteudoModulo?.length) {
            throw new BadRequestException("O conteúdo do módulo é obrigatório");
        }

        return this.cursoService.createCurso(

            data,

            files.file?.[0],

            files.conteudoModulo[0],

            user.usu_id,

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

    @Get('/titulo/:titulo')
    async findCursoByTitulo(
        @Param('titulo') titulo: string) {
        return this.cursoService.findCursoByTitulo(titulo);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    findById(
        @Param("id") id: string,
        @CurrentUser() user: any,
    ) {
        return this.cursoService.findCursoById(
            Number(id),
            user.usu_id,
        );
    }

}