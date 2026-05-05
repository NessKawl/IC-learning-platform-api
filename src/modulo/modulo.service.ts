import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateModuloDto } from './dto/create-modulo.dto.js';

@Injectable()
export class ModuloService {

    constructor(private readonly prismaService: PrismaService) { }

    async createModule(data: CreateModuloDto) {
        return this.prismaService.mod_modulo.create({
            data,
        });
    }

    async findAllModules() {
        return this.prismaService.mod_modulo.findMany();
    }

}
