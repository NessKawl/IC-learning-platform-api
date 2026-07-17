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
        file: Express.Multer.File,
        usuarioId: number
    ) {

        const fileName =
            `cursos/capas/${uuidv4()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket:
                    process.env
                        .AWS_BUCKET_NAME,

                Key:
                    fileName,

                Body:
                    file.buffer,

                ContentType:
                    file.mimetype,
            }),
        );

        const imageUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return this.prismaService.cur_curso.create({
            data: {
                cur_titulo:
                    data.cur_titulo,

                cur_descricao:
                    data.cur_descricao,

                professor_id:
                    usuarioId,

                cur_capa_url:
                    imageUrl,

                cur_publico:
                    data.cur_publico,

                cur_carga_horaria_modulos:
                    data.cur_carga_horaria_modulos,

                cur_conteudo_modulos:
                    data.cur_conteudo_modulos,

                cur_n_modulos:
                    data.cur_n_modulos,

                cur_forma_avaliacao:
                    data.cur_forma_avaliacao,

                cur_status:
                    'PENDENTE',
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
        id: number
    ) {
        return this.prismaService
            .cur_curso
            .findUnique({
                where: {
                    cur_id:
                        Number(id),
                },

                include: {
                    modulos: {
                        include: {
                            materais: {
                                include: {
                                    tim_tipo_matarial:
                                        true,
                                },

                                orderBy: {
                                    mat_ordem:
                                        'asc',
                                },
                            },
                        },
                    },
                },
            });
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
}