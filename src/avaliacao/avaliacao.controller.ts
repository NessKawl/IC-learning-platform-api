import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AvaliacaoService } from './avaliacao.service.js';
import {
    CreateAvaliacaoDto,
} from './dto/create-avaliacao.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt.guards.js';

@Controller('avaliacao')
export class AvaliacaoController {

    constructor(
        private readonly service: AvaliacaoService
    ) { }


    // ==========================================
    // CRIAR AVALIAÇÃO
    // ==========================================

    @Post('register')
    create(
        @Body() dto: CreateAvaliacaoDto
    ) {
        return this.service.createAvaliacao(dto);
    }


    // ==========================================
    // BUSCAR AVALIAÇÃO
    // ==========================================

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.service.findAvaliacaoById(id);
    }


    // ==========================================
    // INICIAR PROVA
    // ==========================================

    @Post(':avaId/iniciar')
    @UseGuards(JwtAuthGuard)
    iniciarProva(
        @Param('avaId', ParseIntPipe) avaId: number,
        @Req() req: any,
    ) {

        return this.service.iniciarProva(
            avaId,
            req.user.usu_id,
        );

    }


    // ==========================================
    // BUSCAR TENTATIVA
    // ==========================================

    @Get('tentativa/:id')
    @UseGuards(JwtAuthGuard)
    async buscarTentativa(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {

        return this.service.buscarTentativa(id);

    }

    @Get('tentativa/:id/qtd-tentativas')
    @UseGuards(JwtAuthGuard)
    async qtdTentativas(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {

        const usuarioId = req.user.usu_id;
        return this.service.qtdTentativas(usuarioId, id);

    }

    // ==========================================
    // RESULTADO DA TENTATIVA
    // ==========================================

    @Get('resultado/:id')
    @UseGuards(JwtAuthGuard)
    async buscarResultado(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {

        return this.service.buscarResultadoTentativa(id);

    }


    // ==========================================
    // SOLICITAR REVISÃO
    // ==========================================

    @Post('tentativas/:tentativaId/revisao')
    @UseGuards(JwtAuthGuard)
    async solicitarRevisao(
        @Param('tentativaId', ParseIntPipe)
        tentativaId: number,

        @Req() req: any,
    ) {

        const usuarioId = req.user.usu_id;

        return this.service.solicitarRevisao(
            tentativaId,
            usuarioId,
        );

    }


    // ==========================================
    // FINALIZAR PROVA
    // ==========================================

    @Post('tentativa/:id/finalizar')
    @UseGuards(JwtAuthGuard)
    finalizar(
        @Param('id', ParseIntPipe) id: number,

        @Body()
        body: {
            respostas: {
                que_id: number;
                alt_id: number;
            }[];
        },

        @Req() req: any,
    ) {

        return this.service.finalizarTentativa(id, body.respostas);

    }

    @UseGuards(JwtAuthGuard)
    @Get("revisoes/professor")
    async buscarSolicitacoesProfessor(@Req() req: any) {

        console.log("USUÁRIO AUTENTICADO:", req.user);

        const professorId = req.user.usu_id;

        return this.service.buscarSolicitacoesRevisaoProfessor(
            professorId
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post("revisoes/:id/aprovar")
    async aprovarSolicitacao(@Param("id", ParseIntPipe) id: number, @Req() req: any) {

        const professorId = req.user.usu_id;

        return this.service.aprovarSolicitacaoRevisao(id, professorId);

    }

    @UseGuards(JwtAuthGuard)
    @Post("revisoes/:id/rejeitar")
    async rejeitarSolicitacao(@Param("id", ParseIntPipe) id: number, @Req() req: any) {

        const professorId = req.user.usu_id;

        return this.service.rejeitarSolicitacaoRevisao(id, professorId);

    }

}