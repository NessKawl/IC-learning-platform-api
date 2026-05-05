import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { usu_usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {

    constructor(private readonly prismaService: PrismaService) { }

    async createUser(data: CreateUserDto): Promise<usu_usuario> {

        const usuarioExistente = await this.prismaService.usu_usuario.findUnique({
            where: { usu_email: data.usu_email }
        });

        if (usuarioExistente) {
            throw new ConflictException('Usuário já cadastrado');
        }

        const hashPassword = await bcrypt.hash(data.usu_senha, 10);


        return this.prismaService.usu_usuario.create({
            data: {
                ...data,
                usu_senha: hashPassword
            }
        })
    }

    async findAllUsers(): Promise<usu_usuario[]> {
        return this.prismaService.usu_usuario.findMany()
    }

    async findOneByEmail(usu_email: string) {
        return this.prismaService.usu_usuario.findUnique({
            where: { usu_email }
        })
    }
}
