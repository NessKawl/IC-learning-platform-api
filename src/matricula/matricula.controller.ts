import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { MatriculaService } from './matricula.service.js';
import { CreateMatriculaDto } from './dto/create-matricula.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guards.js';

@Controller('matricula')
export class MatriculaController {
    constructor(
        private readonly matriculaService: MatriculaService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createMatricula(
        @Body() body: CreateMatriculaDto,
        @Request() req,
    ) {
        console.log(req.user);

        return await this.matriculaService.createMatricula({
            cur_id: body.cur_id,
            usu_id: req.user.usu_id,
        });
    }

    @Get('usuario/:usu_id/curso/:cur_id')
    async buscarMatriculaCurso(
        @Param('usu_id') usu_id: number,
        @Param('cur_id') cur_id: number
    ) {
        return this.matriculaService.buscarMatriculaCurso(
            Number(usu_id),
            Number(cur_id)
        );
    }
}