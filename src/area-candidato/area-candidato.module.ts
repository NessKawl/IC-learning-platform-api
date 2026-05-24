import { Module } from '@nestjs/common';
import { AreaCandidatoController } from './area-candidato.controller.js';
import { AreaCandidatoService } from './area-candidato.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    AreaCandidatoController,
  ],
  providers: [
    AreaCandidatoService,
    PrismaService,
  ],
})
export class AreaCandidatoModule { }