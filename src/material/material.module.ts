import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller.js';
import { MaterialService } from './material.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialController],
  providers: [MaterialService]
})
export class MaterialModule { }
