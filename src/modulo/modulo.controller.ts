import { Body, Controller, Get, Post } from '@nestjs/common';
import { ModuloService } from './modulo.service.js';
import { CreateModuloDto } from './dto/create-modulo.dto.js';

@Controller('modulo')
export class ModuloController {

    constructor(private readonly moduloService: ModuloService) { }

    @Get('all')
    async findAllModules() {
        return this.moduloService.findAllModules()
    }

    @Post('register')
    async createModule(@Body() data: CreateModuloDto) {
        return this.moduloService.createModule(data)
    }


}
