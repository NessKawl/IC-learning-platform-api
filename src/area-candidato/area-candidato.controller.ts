import {
    Controller,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AreaCandidatoService } from './area-candidato.service.js';

@Controller('area-candidato')
export class AreaCandidatoController {
    constructor(
        private readonly areaCandidatoService:
            AreaCandidatoService,
    ) { }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    buscarMinhaArea(
        @Req() req,
    ) {
        console.log(req.user);

        return this.areaCandidatoService.buscarAreaCandidato(
            req.user.usu_id,
        );
    }
}