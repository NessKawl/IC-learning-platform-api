import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { createCursoDto } from './dto/create-curso.dto.js';

import { s3 } from '../config/aws.js';

import { PutObjectCommand } from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CursoService {

    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async createCurso(
        data: createCursoDto,
        file: Express.Multer.File
    ) {


        const fileName = `cursos/capas/${uuidv4()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;;

        return this.prismaService.cur_curso.create({
            data: {
                cur_titulo: data.cur_titulo,
                cur_descricao: data.cur_descricao,

                professor_id: Number(data.professor_id),

                cur_capa_url: imageUrl,
            },
        });
    }

    async findAllCursos() {
        return this.prismaService.cur_curso.findMany();
    }

    async findCursoById(id: number) {
        return this.prismaService.cur_curso.findUnique({
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
                                mat_ordem: 'asc',
                            },
                        },
                    },
                },
            },
        });
    }
}