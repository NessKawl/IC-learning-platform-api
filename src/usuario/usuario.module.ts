import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller.js';
import { UsuarioService } from './usuario.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [UsuarioService],
  controllers: [UsuarioController]
})
export class UsuarioModule { }
