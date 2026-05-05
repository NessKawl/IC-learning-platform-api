import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from '../usuario/dto/create-user.dto.js';
import { UsuarioService } from '../usuario/usuario.service.js';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt.guards.js';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usuarioService: UsuarioService
    ) { }

    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.usuarioService.createUser(createUserDto)
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }
} 