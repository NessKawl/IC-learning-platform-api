import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service.js';
import { CreateAvaliacaoDto, FinalizarProvaDto } from './dto/create-avaliacao.dto.js';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt.guards.js';

@Controller("avaliacao")
export class AvaliacaoController {

    constructor(
        private readonly service: AvaliacaoService
    ) { }

    @Post("register")
    create(
        @Body()
        dto: CreateAvaliacaoDto
    ) {
        return this.service.createAvaliacao(dto);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string
    ) {
        return this.service.findAvaliacaoById(Number(id));
    }

    @Post(":avaId/iniciar")
    @UseGuards(JwtAuthGuard)
    iniciarProva(
        @Param("avaId") avaId: string,
        @Req() req,
    ) {
        return this.service.iniciarProva(
            Number(avaId),
            req.user.usu_id,
        );
    }

    @Get("/tentativa/:id")
    async buscarTentativa(
        @Param("id") id: string,
    ) {
        const response = await this.service.buscarTentativa(
            Number(id),
        );

        console.log(response);
        return response;
    }

    @Post("tentativa/:id/finalizar")
    finalizar(
        @Param("id") id: string,
        @Body() body: {
            respostas: {
                que_id: number;
                alt_id: number;
            }[];
        }
    ) {
        return this.service.finalizarTentativa(
            Number(id),
            body.respostas
        );
    }
}