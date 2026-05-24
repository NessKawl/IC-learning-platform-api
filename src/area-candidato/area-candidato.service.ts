import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AreaCandidatoService {
    constructor(private readonly prismaService: PrismaService) { }


    async buscarAreaCandidato(
        usuId: number,
    ) {
        const usuario =
            await this.prismaService.usu_usuario.findUnique(
                {
                    where: {
                        usu_id: usuId,
                    },

                    select: {
                        usu_id: true,
                        usu_nome: true,
                        usu_email: true,

                        macMatriculas: {
                            include: {
                                cur_curso: {
                                    include: {
                                        modulos: {
                                            include: {
                                                materais: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            );

        if (!usuario) {
            throw new NotFoundException(
                'Usuário não encontrado',
            );
        }

        const cursos =
            usuario.macMatriculas.map(
                (matricula) => ({
                    id: matricula.cur_curso.cur_id,

                    titulo:
                        matricula.cur_curso
                            .cur_titulo,

                    descricao:
                        matricula.cur_curso
                            .cur_descricao,

                    capa:
                        matricula.cur_curso
                            .cur_capa_url,

                    progresso:
                        matricula.mac_progresso,

                    totalModulos:
                        matricula.cur_curso
                            .modulos.length,

                    moduloAtual:
                        matricula.cur_curso
                            .modulos?.[0]
                            ?.mod_titulo ??
                        'Não iniciado',
                }),
            );

        return {
            usuario: {
                id: usuario.usu_id,
                nome: usuario.usu_nome,
                email: usuario.usu_email,
            },

            cursos,
        };
    }
}
