import { Module } from '@nestjs/common';
import { ModuloController } from './modulo.controller.js';
import { ModuloService } from './modulo.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ModuloController],
  providers: [ModuloService]
})
export class ModuloModule { }
