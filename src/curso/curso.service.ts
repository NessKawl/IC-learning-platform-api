import { Injectable } from '@nestjs/common';

import { PrismaService }
    from '../prisma/prisma.service.js';

import { createCursoDto }
    from './dto/create-curso.dto.js';

import { s3 }
    from '../config/aws.js';

import { PutObjectCommand }
    from '@aws-sdk/client-s3';

import { v4 as uuidv4 }
    from 'uuid';

@Injectable()
export class CursoService {

    constructor(
        private readonly prismaService:
            PrismaService
    ) { }

    async createCurso(
        data: createCursoDto,

        capa: Express.Multer.File,

        conteudoModulo: Express.Multer.File,

        usuarioId: number,
    ) {

        const capaName =
            `cursos/capas/${uuidv4()}-${capa.originalname}`;

        await s3.send(
            new PutObjectCommand({

                Bucket: process.env.AWS_BUCKET_NAME,

                Key: capaName,

                Body: capa.buffer,

                ContentType: capa.mimetype,

            }),
        );

        const imageUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${capaName}`;

        let moduloUrl = "";

        if (conteudoModulo) {

            const moduloName =
                `cursos/modulos/${uuidv4()}-${conteudoModulo.originalname}`;

            await s3.send(

                new PutObjectCommand({

                    Bucket:
                        process.env.AWS_BUCKET_NAME,

                    Key:
                        moduloName,

                    Body:
                        conteudoModulo.buffer,

                    ContentType:
                        conteudoModulo.mimetype,

                }),

            );

            moduloUrl =
                `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${moduloName}`;

        }

        return this.prismaService.cur_curso.create({

            data: {

                cur_titulo: data.cur_titulo,

                cur_descricao: data.cur_descricao,

                professor_id: usuarioId,

                cur_capa_url: imageUrl,

                cur_conteudo_modulos: moduloUrl,

                cur_publico: data.cur_publico,

                cur_carga_horaria_modulos:
                    data.cur_carga_horaria_modulos,

                cur_n_modulos:
                    data.cur_n_modulos,

                cur_forma_avaliacao:
                    data.cur_forma_avaliacao,

                cur_status: "PENDENTE",

            },

        });
    }

    async findAllCursos() {
        return this.prismaService
            .cur_curso
            .findMany({
                where: {
                    cur_status:
                        'ATIVO',
                },
            });
    }

    async findCursoById(
        id: number,
        usuarioId: number,
    ) {
        const curso = await this.prismaService.cur_curso.findUnique({
            where: {
                cur_id: Number(id),
            },

            include: {
                modulos: {
                    include: {

                        materais: {
                            include: {
                                tim_tipo_matarial: true,
                            },
                            orderBy: {
                                mat_ordem: "asc",
                            },
                        },

                        avaliacao: {
                            include: {
                                tenTentativas: {

                                    where: {
                                        usu_id: usuarioId,
                                        ten_concluida: true,
                                    },

                                    orderBy: {
                                        ten_dataFim: "desc",
                                    },

                                    take: 1,

                                    select: {
                                        ten_id: true,
                                        ten_nota: true,
                                        ten_acertos: true,
                                    },

                                },
                            },
                        },

                    },
                },
            },
        });


        if (!curso) {
            return null;
        }


        return {
            ...curso,

            modulos: curso.modulos.map((modulo) => {

                if (!modulo.avaliacao) {
                    return modulo;
                }


                const tentativa =
                    modulo.avaliacao.tenTentativas[0];


                return {
                    ...modulo,

                    avaliacao: {

                        ava_id:
                            modulo.avaliacao.ava_id,

                        ava_titulo:
                            modulo.avaliacao.ava_titulo,

                        respondida:
                            !!tentativa,

                        nota:
                            tentativa?.ten_nota ?? null,

                        acertos:
                            tentativa?.ten_acertos ?? null,
                            
                        tentativa_id:
                            tentativa?.ten_id ?? null,

                    },

                };

            }),

        };
    }

    async getCursosPorUsuario(
        usuarioId: number
    ) {
        return this.prismaService
            .cur_curso
            .findMany({
                where: {
                    professor_id:
                        usuarioId,
                },

                select: {
                    cur_id: true,
                    cur_titulo: true,
                    cur_descricao: true,
                    cur_capa_url: true,
                    cur_status: true,

                },
            });
    }

    async getCursosPendentes() {

        return this.prismaService
            .cur_curso.findMany({

                where: {
                    cur_status:
                        'PENDENTE',
                },

                include: {
                    usu_usuario: {

                        select: {
                            usu_nome: true,
                            usu_email: true,
                            usu_curriculo: true,
                            usu_lattes: true,
                            usu_proposta: true
                        },
                    },
                },

                orderBy: {
                    cur_id: 'desc',
                },
            });
    }

    async aprovarCurso(
        id: number
    ) {

        return this.prismaService
            .cur_curso.update({

                where: {
                    cur_id: id,
                },

                data: {
                    cur_status:
                        'ATIVO',
                },
            });
    }

    async rejeitarCurso(
        id: number
    ) {

        return this.prismaService
            .cur_curso.update({

                where: {
                    cur_id: id,
                },

                data: {
                    cur_status:
                        'REJEITADO',
                },
            });
    }

    findCursoByTitulo(
        titulo: string
    ) {
        return this.prismaService
            .cur_curso.findMany({
                where: {
                    cur_titulo: {
                        contains: titulo,
                        mode: 'insensitive',
                    },
                    cur_status: 'ATIVO',
                },
            });
    }
}