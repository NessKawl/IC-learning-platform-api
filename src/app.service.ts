import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return (`
      <h1>Iniciação científica</h1>
      <h2>Rotas disponíveis:</h2>

      <h4>GET:</h4>

      <p><a href="/usuario/all">/usuario/all</a> - Retorna uma lista de usuário</p>

      <p><a href="/curso/all">/curso/all</a> - Retorna uma lista de cursos</p>

      <p><a href="/material/all">/material/all</a> - Retorna uma lista de materiais</p>

      <p><a href="/modulo/all">/modulo/all</a> - Retorna uma lista de módulos</p>

      <h4>POST:</h4>

      <p><a href="/usuario/register">/usuario/register</a> - Cria um novo usuário</p>

      <p><a href="/curso/register">/curso/register</a> - Cria um novo curso</p>

      <p><a href="/material/register">/material/register</a> - Cria um novo material</p>

      <p><a href="/modulo/register">/modulo/register</a> - Cria um novo módulo</p>

      <p><a href="/auth/login">/auth/login</a> - Realiza o login de um usuário</p>

      `);
  }
}
