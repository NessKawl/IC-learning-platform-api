import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';

@Injectable()
export class MaterialService {

    constructor(private readonly prismaService: PrismaService) { }

    async createMaterial(data: CreateMaterialDto) {
        return this.prismaService.mat_material.create({
            data,
        })
    }

    async findAllMaterials() {
        return this.prismaService.mat_material.findMany()
    }

}
