import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guards.js';

import { MaterialService } from './material.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';

@Controller('material')
export class MaterialController {

    constructor(
        private readonly materialService: MaterialService
    ) { }

    @Get('all')
    async findAllMaterials() {
        return this.materialService.findAllMaterials();
    }

    @Post('register')
    @UseInterceptors(FileInterceptor('file'))
    async createMaterial(
        @UploadedFile() file: Express.Multer.File,

        @Body() data: CreateMaterialDto
    ) {
        return this.materialService.createMaterial(
            data,
            file
        );
    }

    @Post("material/:matId/concluir")
    @UseGuards(JwtAuthGuard)
    async concluirMaterial(
        @Param("matId") matId: number,
        @Body("mac_id") mac_id: number,
    ) {

        console.log("matId:", matId);
        console.log("mac_id:", mac_id);

        return this.materialService.concluirMaterial(
            Number(mac_id),
            Number(matId),
        );
    }

    @Get("matricula/:macId")
    async buscarProgresso(
        @Param("macId") macId: number,
    ) {
        return this.materialService.recalcularProgresso(
            Number(macId),
        );
    }
}