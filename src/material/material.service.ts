import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { s3 } from '../config/aws.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class MaterialService {

    constructor(private readonly prismaService: PrismaService) { }

    async createMaterial(
        data: CreateMaterialDto,
        file: Express.Multer.File
    ) {

        const fileName = `cursos/materiais/${uuidv4()}-${file.originalname}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return this.prismaService.mat_material.create({
            data: {
                mat_titulo: data.mat_titulo,
                mat_ordem: Number(data.mat_ordem),

                mod_id: Number(data.mod_id),

                tim_id: Number(data.tim_id),

                mat_url: fileUrl,
            },
        });
    }

    async findAllMaterials() {
        return this.prismaService.mat_material.findMany()
    }

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

        if (existe) {
            return existe;
        }

        await this.prismaService.pro_progresso.create({
            data: {
                mac_id,
                mat_id,
            },
        });

        return this.recalcularProgresso(mac_id);
    }

    async recalcularProgresso(mac_id: number) {

        const matricula =
            await this.prismaService.mac_matricula.findUnique({
                where: {
                    mac_id,
                },
            });

        if (!matricula) {
            throw new BadRequestException(
                "Matrícula não encontrada",
            );
        }

        const totalMateriais =
            await this.prismaService.mat_material.count({
                where: {
                    mod_modulo: {
                        cur_id: matricula.cur_id,
                    },
                },
            });

        const materiaisConcluidos =
            await this.prismaService.pro_progresso.count({
                where: {
                    mac_id,
                },
            });

        const progresso =
            totalMateriais === 0
                ? 0
                : Number(
                    (
                        (materiaisConcluidos /
                            totalMateriais) *
                        100
                    ).toFixed(2),
                );

        await this.prismaService.mac_matricula.update({
            where: {
                mac_id,
            },
            data: {
                mac_progresso: progresso,
            },
        });

        return {
            progresso,
            materiaisConcluidos,
            totalMateriais,
        };
    }

}
