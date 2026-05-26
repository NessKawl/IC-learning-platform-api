import { Module } from '@nestjs/common';
import { MatriculaController } from './matricula.controller.js';
import { MatriculaService } from './matricula.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MatriculaController],
  providers: [MatriculaService]
})
export class MatriculaModule { }
