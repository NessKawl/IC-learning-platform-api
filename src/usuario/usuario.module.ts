import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller.js';
import { UsuarioService } from './usuario.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [PrismaModule],
  providers: [UsuarioService, PrismaService],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule { }
