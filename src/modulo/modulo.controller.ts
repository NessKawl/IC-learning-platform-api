import {
    Body,
    Controller,
    Get,
    Param,
    Post
} from '@nestjs/common';

import { ModuloService } from './modulo.service.js';
import { CreateModuloDto } from './dto/create-modulo.dto.js';

@Controller('modulo')
export class ModuloController {

    constructor(
        private readonly moduloService: ModuloService
    ) { }

    @Get('all')
    async findAllModules() {
        return this.moduloService.findAllModules();
    }

    @Get('curso/:cur_id')
    async findModulesByCourse(
        @Param('cur_id') cur_id: string
    ) {
        return this.moduloService.findModulesByCourse(
            Number(cur_id)
        );
    }

    @Post('register')
    async createModule(
        @Body() data: CreateModuloDto
    ) {
        return this.moduloService.createModule(data);
    }
}