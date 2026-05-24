import { Injectable } from '@nestjs/common';
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

}
