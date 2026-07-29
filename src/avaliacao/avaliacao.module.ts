import { Module } from '@nestjs/common';
import { AvaliacaoController } from './avaliacao.controller.js';
import { AvaliacaoService } from './avaliacao.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AvaliacaoController],
  providers: [AvaliacaoService]
})
export class AvaliacaoModule { }
