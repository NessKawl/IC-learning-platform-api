import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'usu_email',
            passwordField: 'usu_senha',
        });
    }

    async validate(usu_email: string, usu_senha: string): Promise<any> {
        const user = await this.authService.validateUser(usu_email, usu_senha);

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        return user;
    }
}