import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import { PrismaClient } from 'generated/prisma/client'

dotenv.config()

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = process.env.DATABASE_URL

        if (!connectionString) {
            throw new Error('DATABASE_URL não está definida no .env')
        }

        const adapter = new PrismaPg({
            connectionString,
        })

        super({ adapter })
    }

    async onModuleInit() {
        await this.$connect().then((result) => {
            console.log("Conectado ao banco de dados com sucesso");
        }).catch((err) => {
            console.log("ERRO AO CONECTAR AO BANCO DE DADOS: ", err);
        })
    }
}