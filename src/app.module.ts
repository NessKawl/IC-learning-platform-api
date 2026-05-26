import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MaterialModule } from './material/material.module.js';
import { CursoModule } from './curso/curso.module.js';
import { ModuloModule } from './modulo/modulo.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AreaCandidatoModule } from './area-candidato/area-candidato.module.js';
import { MatriculaModule } from './matricula/matricula.module.js';

@Module({
  imports: [PrismaModule, UsuarioModule, MaterialModule, CursoModule, ModuloModule, AuthModule, AreaCandidatoModule, MatriculaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
