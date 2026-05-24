import {
    Body,
    Controller,
    Get,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

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
}