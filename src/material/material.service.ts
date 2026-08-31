import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { s3 } from '../config/aws.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MaterialService {

    constructor(
        private readonly prismaService: PrismaService
    ) { }


    async createMaterial(
        data: CreateMaterialDto,
        file: Express.Multer.File
    ) {

        const fileName =
            `cursos/materiais/${uuidv4()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({

                Bucket:
                    process.env.AWS_BUCKET_NAME,

                Key:
                    fileName,

                Body:
                    file.buffer,

                ContentType:
                    file.mimetype,

            }),
        );

        const fileUrl =
            `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;


        return this.prismaService.mat_material.create({

            data: {

                mat_titulo:
                    data.mat_titulo,

                mat_ordem:
                    Number(data.mat_ordem),

                mod_id:
                    Number(data.mod_id),

                tim_id:
                    Number(data.tim_id),

                mat_url:
                    fileUrl,

            },

        });

    }


    async findAllMaterials() {

        return this.prismaService
            .mat_material
            .findMany();

    }


    /*
     * =====================================================
     * CONCLUIR MATERIAL
     * =====================================================
     */

    async concluirMaterial(
        mac_id: number,
        mat_id: number,
    ) {

        const existe =
            await this.prismaService.pro_progresso.findUnique({

                where: {

                    mac_id_mat_id: {

                        mac_id,

                        mat_id,

                    },

                },

            });


        /*
         * Se já concluiu, apenas recalcula
         */

        if (!existe) {

            await this.prismaService.pro_progresso.create({

                data: {

                    mac_id,

                    mat_id,

                },

            });

        }


        return this.recalcularProgresso(mac_id);

    }


    /*
     * =====================================================
     * RECALCULAR PROGRESSO
     * =====================================================
     */

    async recalcularProgresso(
        mac_id: number,
    ) {

        const matricula =
            await this.prismaService.mac_matricula.findUnique({

                where: {
                    mac_id,
                },

                select: {

                    mac_id: true,

                    usu_id: true,

                    cur_id: true,

                },

            });


        if (!matricula) {

            throw new BadRequestException(
                "Matrícula não encontrada",
            );

        }


        /*
         * Busca todos os módulos do curso
         */
        const modulos =
            await this.prismaService.mod_modulo.findMany({

                where: {
                    cur_id: matricula.cur_id,
                },

                include: {

                    materais: {
                        select: {
                            mat_id: true,
                        },
                    },

                    avaliacao: {
                        select: {
                            ava_id: true,
                        },
                    },

                },

            });


        /*
         * Materiais concluídos
         */
        const materiaisConcluidos =
            await this.prismaService.pro_progresso.findMany({

                where: {
                    mac_id,
                },

                select: {
                    mat_id: true,
                },

            });


        const materiaisConcluidosIds =
            new Set(
                materiaisConcluidos.map(
                    item => item.mat_id
                )
            );


        /*
         * Avaliações aprovadas
         */
        const avaliacoesAprovadas =
            await this.prismaService.ten_tentativa.findMany({

                where: {

                    usu_id:
                        matricula.usu_id,

                    ten_concluida:
                        true,

                    ten_nota: {
                        gte: 7.5,
                    },

                    ava_avaliacao: {
                        modulo: {
                            cur_id:
                                matricula.cur_id,
                        },
                    },

                },

                select: {

                    ava_id: true,

                },

            });


        const avaliacoesAprovadasIds =
            new Set(
                avaliacoesAprovadas.map(
                    item => item.ava_id
                )
            );


        /*
         * Calcula materiais + avaliações
         */
        let totalItens = 0;

        let itensConcluidos = 0;


        for (const modulo of modulos) {

            /*
             * MATERIAIS
             */

            totalItens +=
                modulo.materais.length;


            const materiaisModuloConcluidos =
                modulo.materais.filter(
                    material =>
                        materiaisConcluidosIds.has(
                            material.mat_id
                        )
                ).length;


            itensConcluidos +=
                materiaisModuloConcluidos;


            /*
             * AVALIAÇÃO
             */

            if (modulo.avaliacao) {

                totalItens++;


                if (
                    avaliacoesAprovadasIds.has(
                        modulo.avaliacao.ava_id
                    )
                ) {

                    itensConcluidos++;

                }

            }

        }


        /*
         * Calcula progresso
         */
        const progresso =
            totalItens === 0
                ? 0
                : Number(

                    (
                        (itensConcluidos /
                            totalItens) *
                        100

                    ).toFixed(2)

                );


        /*
         * Atualiza matrícula
         */
        await this.prismaService.mac_matricula.update({

            where: {
                mac_id,
            },

            data: {

                mac_progresso:
                    progresso,

            },

        });


        return {

            progresso,

            itensConcluidos,

            totalItens,

        };

    }


    /*
     * =====================================================
     * REMOVER PROGRESSO DO MÓDULO
     * =====================================================
     */

    async removerProgressoModulo(
        mac_id: number,
        mod_id: number,
    ) {

        await this.prismaService.pro_progresso.deleteMany({

            where: {

                mac_id,

                material: {

                    mod_id,

                },

            },

        });


        return this.recalcularProgresso(mac_id);

    }

}