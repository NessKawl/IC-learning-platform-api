import { Module } from '@nestjs/common';
import { CursoController } from './curso.controller.js';
import { CursoService } from './curso.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CursoController],
  providers: [CursoService]
})
export class CursoModule { }
