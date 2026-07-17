import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MatriculaService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async createMatricula(data: {
        cur_id: number;
        usu_id: number;
    }) {

        const matriculaExistente =
            await this.prismaService.mac_matricula.findFirst({
                where: {
                    usu_id: data.usu_id,
                    cur_id: data.cur_id,
                },
            });

        if (matriculaExistente) {
            throw new BadRequestException(
                'Usuário já matriculado nesse curso',
            );
        }

        return await this.prismaService.mac_matricula.create({
            data: {
                cur_id: data.cur_id,
                usu_id: data.usu_id,
                mac_progresso: 0,
            },
        });
    }

    async buscarMatriculaCurso(
        usu_id: number,
        cur_id: number
    ) {
        const matricula = await this.prismaService.mac_matricula.findFirst({
            where: {
                usu_id: usu_id,
                cur_id: cur_id,
            },
        });

        if (!matricula) {
            return null;
        }

        return {
            matriculado: true,
            progresso: matricula.mac_progresso ?? 0,
            mac_id: matricula.mac_id,
        };
    }

    async contarAlunosProfessor(professorId: number) {
        const total = await this.prismaService.mac_matricula.count({
            where: {
                cur_curso: {
                    professor_id: professorId, // id do professor dono do curso
                },
            },
        });

        return {
            totalAlunos: total,
        };
    }
}