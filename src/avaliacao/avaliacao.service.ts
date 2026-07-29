import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAvaliacaoDto, FinalizarProvaDto } from './dto/create-avaliacao.dto.js';

@Injectable()
export class AvaliacaoService {

    constructor(
        private prisma: PrismaService
    ) { }

    async createAvaliacao(
        dto: CreateAvaliacaoDto
    ) {

        console.log(JSON.stringify(dto, null, 2));

        return this.prisma.$transaction(
            async (tx) => {

                const existe =
                    await tx.ava_avaliacao.findUnique({

                        where: {
                            mod_id: dto.mod_id
                        }

                    });

                if (existe) {

                    throw new BadRequestException(
                        "Este módulo já possui uma avaliação."
                    );

                }

                const avaliacao =
                    await tx.ava_avaliacao.create({

                        data: {

                            ava_titulo: dto.ava_titulo,

                            ava_tipo: dto.ava_tipo,

                            ava_tempo_limite:
                                dto.ava_tempo_limite,

                            proctoring:
                                dto.proctoring,

                            mod_id:
                                dto.mod_id
                        }

                    });

                await Promise.all(

                    dto.questoes.map(async (questao) => {

                        const novaQuestao =
                            await tx.que_questao.create({

                                data: {
                                    que_texto: questao.texto,
                                    que_tipo: "OBJETIVA",
                                    ava_id: avaliacao.ava_id
                                }

                            });

                        await tx.alt_alternativa.createMany({

                            data:
                                questao.alternativas.map(a => ({
                                    alt_texto: a.texto,
                                    alt_correta: a.correta,
                                    que_id: novaQuestao.que_id
                                }))

                        });

                    })

                );

                return avaliacao;

            },

            {
                timeout: 20000
            }
        );
    }


    async iniciarProva(
        avaId: number,
        usuarioId: number,
    ) {

        const avaliacao =
            await this.prisma.ava_avaliacao.findUnique({

                where: {
                    ava_id: avaId,
                },

                include: {

                    questoes: {

                        include: {

                            alternativa: {

                                select: {
                                    alt_id: true,
                                    alt_texto: true
                                }

                            }

                        }

                    }

                }

            });

        if (!avaliacao)
            throw new NotFoundException();

        const questoes = [...avaliacao.questoes]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        return this.prisma.$transaction(async tx => {

            const tentativa =
                await tx.ten_tentativa.create({

                    data: {

                        usu_id: usuarioId,

                        ava_id: avaId,

                        ten_nota: 0,

                        ten_acertos: 0,

                        ten_total_questoes: 5,

                        ten_concluida: false,

                        ten_dataFim: new Date()

                    }

                });

            await tx.ten_questao.createMany({

                data: questoes.map(q => ({

                    ten_id: tentativa.ten_id,

                    que_id: q.que_id

                }))

            });

            return {

                tentativaId: tentativa.ten_id,

                titulo: avaliacao.ava_titulo,

                tempo: avaliacao.ava_tempo_limite,

                questoes

            };

        });

    }

    async findAvaliacaoById(
        id: number
    ) {
        const avaliacao = await this.prisma.ava_avaliacao.findUnique({

            where: {
                ava_id: id
            },

            include: {
                questoes: {
                    include: {
                        alternativa: true
                    }
                }
            }
        });

        if (!avaliacao) {
            return null;
        }

        // Embaralha as questões
        const questoesAleatorias = [...avaliacao.questoes]
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        return {
            ...avaliacao,
            questoes: questoesAleatorias,
        };
    }

    async buscarTentativa(
        id: number,
    ) {

        const tentativa =
            await this.prisma.ten_tentativa.findUnique({

                where: {
                    ten_id: id,
                },

                include: {

                    tenQuestaos: {

                        include: {

                            questao: {

                                include: {

                                    alternativa: {

                                        select: {

                                            alt_id: true,
                                            alt_texto: true,

                                        }

                                    }

                                }

                            }

                        }

                    },

                    ava_avaliacao: {

                        select: {

                            ava_titulo: true,

                            ava_tempo_limite: true,

                        }

                    }

                }

            });

        if (!tentativa)
            throw new NotFoundException();

        return {

            tentativaId: tentativa.ten_id,

            titulo: tentativa.ava_avaliacao.ava_titulo,

            tempo: tentativa.ava_avaliacao.ava_tempo_limite,

            questoes: tentativa.tenQuestaos.map(q => q.questao),

        };

    }

    async finalizarTentativa(
        tentativaId: number,
        respostas: {
            que_id: number;
            alt_id: number;
        }[]
    ) {

        const tentativa =
            await this.prisma.ten_tentativa.findUnique({

                where: {
                    ten_id: tentativaId
                },

                include: {
                    tenQuestaos: {
                        include: {
                            questao: {
                                include: {
                                    alternativa: true
                                }
                            }
                        }
                    }
                }

            });

        if (!tentativa)
            throw new NotFoundException();

        let acertos = 0;

        await this.prisma.$transaction(async tx => {

            for (const resposta of respostas) {

                const questao =
                    tentativa.tenQuestaos.find(
                        q => q.que_id === resposta.que_id
                    );

                if (!questao)
                    continue;

                const correta =
                    questao.questao.alternativa.find(
                        a => a.alt_correta
                    );

                if (correta?.alt_id === resposta.alt_id)
                    acertos++;


                const existe = await tx.res_resposta.findFirst({
                    where: {
                        ten_id: tentativaId,
                        que_id: resposta.que_id
                    }
                });

                if (!existe) {
                    await tx.res_resposta.create({
                        data: {
                            ten_id: tentativaId,
                            que_id: resposta.que_id,
                            alt_id: resposta.alt_id
                        }
                    });
                }

            }

            const nota =
                (acertos / tentativa.ten_total_questoes) * 10;

            await tx.ten_tentativa.update({

                where: {
                    ten_id: tentativaId
                },

                data: {

                    ten_acertos: acertos,

                    ten_nota: nota,

                    ten_concluida: true,

                    ten_dataFim: new Date()

                }

            });

            if (nota >= 7) {

                const avaliacao =
                    await tx.ava_avaliacao.findUnique({

                        where: {
                            ava_id: tentativa.ava_id
                        },

                        include: {
                            modulo: {
                                include: {
                                    cur_curso: true
                                }
                            }
                        }

                    });

                const matricula =
                    await tx.mac_matricula.findFirst({

                        where: {

                            usu_id: tentativa.usu_id,

                            cur_id: avaliacao!.modulo.cur_id

                        }

                    });


                const totalModulos =
                    await tx.mod_modulo.count({

                        where: {
                            cur_id: avaliacao!.modulo.cur_id
                        }

                    });

                const aprovadas = await tx.ten_tentativa.findMany({
                    where: {
                        usu_id: tentativa.usu_id,
                        ten_nota: {
                            gte: 7
                        },
                        ava_avaliacao: {
                            modulo: {
                                cur_id: avaliacao!.modulo.cur_id
                            }
                        }
                    },
                    distinct: ["ava_id"],
                    select: {
                        ava_id: true
                    }
                });

                const progresso =
                    (aprovadas.length / totalModulos) * 100;

                if (matricula) {

                    await tx.mac_matricula.update({
                        where: {
                            mac_id: matricula.mac_id
                        },
                        data: {
                            mac_progresso: progresso
                        }
                    });
                }

                await tx.mac_matricula.update({

                    where: {
                        mac_id: matricula!.mac_id
                    },

                    data: {
                        mac_progresso: progresso
                    }

                });

            }

        });

        return {

            nota: (acertos / tentativa.ten_total_questoes) * 10,

            acertos,

            total: tentativa.ten_total_questoes

        };

    }

    async finalizarProva(
        dto: FinalizarProvaDto,
    ) {

        return this.prisma.$transaction(async tx => {

            const tentativa =
                await tx.ten_tentativa.findUnique({

                    where: {
                        ten_id: dto.tentativaId
                    }

                });

            if (!tentativa)
                throw new NotFoundException("Tentativa não encontrada.");

            if (tentativa.ten_concluida)
                throw new BadRequestException("Essa prova já foi finalizada.");

            const questoesTentativa =
                await tx.ten_questao.findMany({

                    where: {
                        ten_id: tentativa.ten_id
                    },

                    include: {

                        questao: {

                            include: {

                                alternativa: true

                            }

                        }

                    }

                });

            let acertos = 0;

            for (const resposta of dto.respostas) {

                const questao =
                    questoesTentativa.find(
                        q => q.que_id === resposta.que_id
                    );

                if (!questao)
                    continue;

                const correta =
                    questao.questao.alternativa.find(
                        a => a.alt_correta
                    );

                if (correta?.alt_id === resposta.alt_id)
                    acertos++;

                await tx.res_resposta.create({

                    data: {

                        ten_id: tentativa.ten_id,

                        que_id: resposta.que_id,

                        alt_id: resposta.alt_id

                    }

                });

            }

            const nota =
                Number(
                    ((acertos / questoesTentativa.length) * 10)
                        .toFixed(2)
                );

            await tx.ten_tentativa.update({

                where: {
                    ten_id: tentativa.ten_id
                },

                data: {

                    ten_concluida: true,

                    ten_acertos: acertos,

                    ten_nota: nota,

                    ten_dataFim: new Date()

                }

            });

            return {

                nota,

                acertos,

                total: questoesTentativa.length

            };

        });

    }

}
