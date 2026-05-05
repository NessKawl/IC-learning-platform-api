import { Body, Controller, Get, Post } from '@nestjs/common';
import { MaterialService } from './material.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';

@Controller('material')
export class MaterialController {

    constructor(private readonly materialService: MaterialService) { }

    @Get('all')
    async findAllMaterials() {
        return this.materialService.findAllMaterials()
    }

    @Post('register')
    async createMaterial(@Body() data: CreateMaterialDto) {
        return this.materialService.createMaterial(data)
    }

}
