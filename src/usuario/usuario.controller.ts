import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('usuario')
export class UsuarioController {

    constructor(private readonly usuarioService: UsuarioService) { }

    @Get('all')
    async findAllUsers() {
        return this.usuarioService.findAllUsers()
    }

    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.usuarioService.createUser(createUserDto)
    }

}
