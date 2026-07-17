import { Body, Controller, Get, Param, Patch, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsuarioService } from './usuario.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserProfessorDto } from './dto/create-user-professor.dto.js'

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

    @Post('/register-professor')
    @UseInterceptors(FileInterceptor('file'))
    createProfessor(
        @Body() data: CreateUserProfessorDto,

        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.usuarioService.createUserProfessor(
            data,
            file,
        );
    }

    @Get('/pendentes')
    buscarPendentes() {
        return this.usuarioService.buscarPendentes();
    }

    @Patch('/aprovar/:id')
    aprovar(@Param('id') id: string) {
        return this.usuarioService.aprovarUsuario(Number(id));
    }

    @Patch('/rejeitar/:id')
    rejeitar(@Param('id') id: string) {
        return this.usuarioService.rejeitarUsuario(Number(id));
    }
}
