import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsuarioService } from '../usuario/usuario.service.js';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
    ) { }

    async validateUser(usu_email: string, senhaRecebida: string): Promise<any> {
        const user = await this.usuarioService.findOneByEmail(usu_email);

        if (!user) {
            console.log("Usuário não cadastrado");
            return null
        }

        const isPasswordValid = await bcrypt.compare(senhaRecebida, user.usu_senha)

        if (isPasswordValid) {
            console.log("SUCESSO: Usuário validado!");
            const { usu_senha, ...result } = user
            return result;
        }

        console.log("ERRO: Senha Inválida");
        return null
    }

    async login(user: any) {
        const payload = {
            usu_id:
                user.usu_id,

            usu_email:
                user.usu_email,

            usu_nome:
                user.usu_nome,

            id_tipo_usuario:
                user.tiu_id,
        };

        const { usu_senha, ...userData } = user

        return {
            access_token: this.jwtService.sign(payload),
            user: userData
        }
    }

}