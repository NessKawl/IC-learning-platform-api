import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAvaliacaoDto, FinalizarProvaDto } from './dto/create-avaliacao.dto.js';

@Injectable()
export class AvaliacaoService {

    constructor(
        private prisma: PrismaService,

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

        return this.prisma.$transaction(async tx => {

            /*
             * Busca a avaliação
             */
            const avaliacao =
                await tx.ava_avaliacao.findUnique({

                    where: {
                        ava_id: avaId,
                    },

                    include: {

                        modulo: {
                            select: {
                                mod_id: true,
                                mod_titulo: true,

                                cur_curso: {
                                    select: {
                                        cur_id: true,
                                        cur_titulo: true,
                                    },
                                },
                            },
                        },

                        questoes: {
                            include: {
                                alternativa: {
                                    select: {
                                        alt_id: true,
                                        alt_texto: true,
                                    },
                                },
                            },
                        },

                    },

                });


            if (!avaliacao) {
                throw new NotFoundException(
                    "Avaliação não encontrada."
                );
            }


            /*
 * Busca quantidade de tentativas concluídas
 */
            const qtdTentativas =
                await tx.ten_tentativa.count({
                    where: {
                        usu_id: usuarioId,
                        ava_id: avaId,
                        ten_concluida: true,
                    },
                });


            /*
             * ==========================================
             * REGRA DE TENTATIVAS
             * ==========================================
             *
             * 0, 1 ou 2 tentativas:
             * pode iniciar normalmente.
             *
             * 3 tentativas:
             * precisa de autorização do professor.
             *
             * Mais de 3:
             * não pode realizar novamente.
             */

            if (qtdTentativas >= 3) {

                /*
                 * Busca autorização aprovada
                 */
                const revisao =
                    await tx.rev_revisao_avaliacao.findFirst({

                        where: {

                            usu_id: usuarioId,

                            ava_id: avaId,

                            rev_status: "APROVADA",

                        },

                        orderBy: {

                            rev_id: "desc",

                        },

                    });


                /*
                 * Não possui autorização
                 */
                if (!revisao) {

                    throw new BadRequestException(
                        qtdTentativas === 3
                            ? "Você atingiu o limite de 3 tentativas. Solicite autorização ao professor para realizar uma nova tentativa."
                            : "Você não possui autorização para realizar uma nova tentativa."
                    );

                }

            }


            /*
             * Seleciona as questões
             */
            const questoes =
                [...avaliacao.questoes]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5);


            /*
             * Cria nova tentativa
             */
            const tentativa =
                await tx.ten_tentativa.create({

                    data: {

                        usu_id:
                            usuarioId,

                        ava_id:
                            avaId,

                        ten_nota:
                            0,

                        ten_acertos:
                            0,

                        ten_total_questoes:
                            questoes.length,

                        ten_concluida:
                            false,

                        ten_dataInicio:
                            new Date(),

                        ten_dataFim:
                            new Date(),

                    },

                });


            /*
             * Relaciona questões
             */
            await tx.ten_questao.createMany({

                data:
                    questoes.map(q => ({

                        ten_id:
                            tentativa.ten_id,

                        que_id:
                            q.que_id,

                    })),

            });


            return {

                tentativaId:
                    tentativa.ten_id,

                titulo:
                    avaliacao.ava_titulo,

                modulo:
                    avaliacao.modulo.mod_id,

                modulo_titulo:
                    avaliacao.modulo.mod_titulo,

                curso:
                    avaliacao.modulo.cur_curso.cur_id,

                tempo:
                    avaliacao.ava_tempo_limite,

                questoes,

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

        const tentativa = await this.prisma.ten_tentativa.findUnique({
            where: {
                ten_id: id,
            },

            include: {
                ava_avaliacao: {
                    include: {
                        modulo: {
                            select: {
                                mod_id: true,
                                mod_titulo: true,
                                cur_curso: {
                                    select: {
                                        cur_id: true,
                                        cur_titulo: true,
                                    },
                                },
                            },
                        },
                    },
                },

                tenQuestaos: {
                    include: {
                        questao: {
                            include: {
                                alternativa: {
                                    select: {
                                        alt_id: true,
                                        alt_texto: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!tentativa)
            throw new NotFoundException();

        return {

            tentativaId: tentativa.ten_id,

            titulo: tentativa.ava_avaliacao.ava_titulo,

            tempo: tentativa.ava_avaliacao.ava_tempo_limite,

            modulo_titulo: tentativa.ava_avaliacao.modulo.mod_titulo,

            curso: tentativa.ava_avaliacao.modulo.cur_curso.cur_id,

            questoes: tentativa.tenQuestaos.map(q => q.questao),

        };

    }

    private async recalcularProgressoCurso(
        tx: any,
        matriculaId: number,
        usuarioId: number,
        cursoId: number,
    ) {

        const modulos = await tx.mod_modulo.findMany({

            where: {
                cur_id: cursoId,
            },

            include: {

                materais: {
                    select: {
                        mat_id: true,
                    },
                },

                avaliacao: {
                    select: {
                        ava_id: true,
                    },
                },

            },

        });


        /*
         * Materiais concluídos pelo aluno
         */

        const materiaisConcluidos =
            await tx.pro_progresso.findMany({

                where: {
                    mac_id: matriculaId,
                },

                select: {
                    mat_id: true,
                },

            });


        const materiaisConcluidosIds =
            new Set(
                materiaisConcluidos.map(
                    item => item.mat_id
                )
            );


        /*
         * Avaliações aprovadas pelo aluno
         */

        const avaliacoesAprovadas =
            await tx.ten_tentativa.findMany({

                where: {

                    usu_id: usuarioId,

                    ten_concluida: true,

                    ten_nota: {
                        gte: 7.5,
                    },

                    ava_avaliacao: {
                        modulo: {
                            cur_id: cursoId,
                        },
                    },

                },

                select: {
                    ava_id: true,
                },

            });


        const avaliacoesAprovadasIds =
            new Set(
                avaliacoesAprovadas.map(
                    item => item.ava_id
                )
            );


        let totalItens = 0;

        let itensConcluidos = 0;


        /*
         * Calcula materiais + avaliações
         */

        for (const modulo of modulos) {

            /*
             * =========================
             * MATERIAIS
             * =========================
             */

            totalItens += modulo.materais.length;


            const materiaisModuloConcluidos =
                modulo.materais.filter(
                    material =>
                        materiaisConcluidosIds.has(
                            material.mat_id
                        )
                ).length;


            itensConcluidos +=
                materiaisModuloConcluidos;


            /*
             * =========================
             * AVALIAÇÃO
             * =========================
             */

            if (modulo.avaliacao) {

                /*
                 * A avaliação conta como
                 * mais um item do curso.
                 */

                totalItens++;


                /*
                 * Só conta como concluída
                 * se tiver nota >= 7.5
                 */

                if (
                    avaliacoesAprovadasIds.has(
                        modulo.avaliacao.ava_id
                    )
                ) {

                    itensConcluidos++;

                }

            }

        }


        /*
         * Calcula percentual
         */

        const progresso =
            totalItens === 0
                ? 0
                : Number(
                    (
                        (itensConcluidos /
                            totalItens) *
                        100
                    ).toFixed(2)
                );


        /*
         * Atualiza matrícula
         */

        await tx.mac_matricula.update({

            where: {
                mac_id: matriculaId,
            },

            data: {
                mac_progresso: progresso,
            },

        });


        return progresso;
    }

    async finalizarTentativa(
        tentativaId: number,
        respostas: {
            que_id: number;
            alt_id: number;
        }[]
    ) {

        return this.prisma.$transaction(async tx => {

            /*
             * ==========================================
             * 1. BUSCA A TENTATIVA
             * ==========================================
             */

            const tentativa =
                await tx.ten_tentativa.findUnique({

                    where: {
                        ten_id: tentativaId,
                    },

                    include: {

                        ava_avaliacao: {
                            include: {
                                modulo: true,
                            },
                        },

                        tenQuestaos: {
                            include: {
                                questao: {
                                    include: {
                                        alternativa: true,
                                    },
                                },
                            },
                        },

                    },

                });


            if (!tentativa) {

                throw new NotFoundException(
                    "Tentativa não encontrada."
                );

            }


            /*
             * Impede finalizar duas vezes
             */

            if (tentativa.ten_concluida) {

                throw new BadRequestException(
                    "Essa prova já foi finalizada."
                );

            }


            /*
             * ==========================================
             * 2. CORRIGE AS RESPOSTAS
             * ==========================================
             */

            let acertos = 0;


            for (const resposta of respostas) {

                const questao =
                    tentativa.tenQuestaos.find(
                        q =>
                            q.que_id ===
                            resposta.que_id
                    );


                /*
                 * Ignora questões que não
                 * pertencem à tentativa
                 */

                if (!questao) {
                    continue;
                }


                /*
                 * Busca alternativa correta
                 */

                const alternativaCorreta =
                    questao.questao.alternativa.find(
                        alternativa =>
                            alternativa.alt_correta === true
                    );


                /*
                 * Verifica acerto
                 */

                if (
                    alternativaCorreta &&
                    alternativaCorreta.alt_id ===
                    resposta.alt_id
                ) {

                    acertos++;

                }


                /*
                 * Evita resposta duplicada
                 */

                const respostaExistente =
                    await tx.res_resposta.findFirst({

                        where: {

                            ten_id:
                                tentativa.ten_id,

                            que_id:
                                resposta.que_id,

                        },

                    });


                if (!respostaExistente) {

                    await tx.res_resposta.create({

                        data: {

                            ten_id:
                                tentativa.ten_id,

                            que_id:
                                resposta.que_id,

                            alt_id:
                                resposta.alt_id,

                        },

                    });

                }

            }


            /*
             * ==========================================
             * 3. CALCULA NOTA
             * ==========================================
             */

            const totalQuestoes =
                tentativa.ten_total_questoes;


            const nota =
                totalQuestoes === 0
                    ? 0
                    : Number(
                        (
                            (acertos /
                                totalQuestoes) *
                            10
                        ).toFixed(2)
                    );


            /*
             * >= 7.5 = aprovado
             */

            const aprovado =
                nota >= 7.5;


            /*
             * ==========================================
             * 4. BUSCA MATRÍCULA
             * ==========================================
             */

            const matricula =
                await tx.mac_matricula.findFirst({

                    where: {

                        usu_id:
                            tentativa.usu_id,

                        cur_id:
                            tentativa
                                .ava_avaliacao
                                .modulo
                                .cur_id,

                    },

                });


            if (!matricula) {

                throw new NotFoundException(
                    "Matrícula não encontrada."
                );

            }


            /*
             * ==========================================
             * 5. SE REPROVOU
             * ==========================================
             *
             * Mantemos a sua regra:
             *
             * - Remove progresso dos materiais
             *   daquele módulo.
             *
             * - A avaliação também NÃO conta
             *   para o progresso.
             *
             */

            if (!aprovado) {

                const materiaisModulo =
                    await tx.mat_material.findMany({

                        where: {

                            mod_id:
                                tentativa
                                    .ava_avaliacao
                                    .modulo
                                    .mod_id,

                        },

                        select: {

                            mat_id: true,

                        },

                    });


                const materialIds =
                    materiaisModulo.map(
                        material =>
                            material.mat_id
                    );


                /*
                 * Remove progresso dos materiais
                 * pertencentes ao módulo.
                 */

                if (materialIds.length > 0) {

                    await tx.pro_progresso.deleteMany({

                        where: {

                            mac_id:
                                matricula.mac_id,

                            mat_id: {
                                in: materialIds,
                            },

                        },

                    });

                }

            }


            /*
             * ==========================================
             * 6. FINALIZA A TENTATIVA
             * ==========================================
             */

            await tx.ten_tentativa.update({

                where: {

                    ten_id:
                        tentativa.ten_id,

                },

                data: {

                    ten_concluida:
                        true,

                    ten_acertos:
                        acertos,

                    ten_nota:
                        nota,

                    ten_dataFim:
                        new Date(),

                },

            });


            /*
             * ==========================================
             * 7. RECALCULA PROGRESSO
             * ==========================================
             *
             * Aqui está a parte importante.
             *
             * A função considera:
             *
             * - materiais concluídos
             * - avaliações aprovadas
             *
             */

            const progresso =
                await this.recalcularProgressoCurso(

                    tx,

                    matricula.mac_id,

                    tentativa.usu_id,

                    matricula.cur_id,

                );


            /*
             * ==========================================
             * 8. RETORNO
             * ==========================================
             */

            return {

                nota,

                acertos,

                total:
                    totalQuestoes,

                progresso,

                aprovado,

            };

        });

    }
    async finalizarProva(
        dto: FinalizarProvaDto,
    ) {

        return this.prisma.$transaction(async tx => {

            /*
             * 1. Busca a tentativa
             */

            const tentativa =
                await tx.ten_tentativa.findUnique({

                    where: {
                        ten_id: dto.tentativaId
                    },

                    include: {
                        ava_avaliacao: {
                            include: {
                                modulo: true
                            }
                        }
                    }

                });

            if (!tentativa) {
                throw new NotFoundException(
                    "Tentativa não encontrada."
                );
            }

            if (tentativa.ten_concluida) {
                throw new BadRequestException(
                    "Essa prova já foi finalizada."
                );
            }


            /*
             * 2. Busca as questões da tentativa
             */

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


            /*
             * 3. Corrige as respostas
             */

            let acertos = 0;

            for (const resposta of dto.respostas) {

                const questao =
                    questoesTentativa.find(
                        q => q.que_id === resposta.que_id
                    );

                if (!questao) {
                    continue;
                }


                const correta =
                    questao.questao.alternativa.find(
                        a => a.alt_correta
                    );


                if (correta?.alt_id === resposta.alt_id) {
                    acertos++;
                }


                /*
                 * Evita duplicar respostas
                 */

                const existe =
                    await tx.res_resposta.findFirst({

                        where: {
                            ten_id: tentativa.ten_id,
                            que_id: resposta.que_id
                        }

                    });


                if (!existe) {

                    await tx.res_resposta.create({

                        data: {

                            ten_id: tentativa.ten_id,

                            que_id: resposta.que_id,

                            alt_id: resposta.alt_id

                        }

                    });

                }

            }


            /*
             * 4. Calcula a nota
             */

            const nota =
                Number(
                    (
                        (acertos / questoesTentativa.length) * 10
                    ).toFixed(2)
                );


            const aprovado = nota >= 7.5;


            /*
             * 5. Busca a matrícula do aluno
             */

            const matricula =
                await tx.mac_matricula.findFirst({

                    where: {

                        usu_id: tentativa.usu_id,

                        cur_id:
                            tentativa.ava_avaliacao.modulo.cur_id

                    }

                });


            if (!matricula) {

                throw new NotFoundException(
                    "Matrícula não encontrada."
                );

            }


            /*
             * 6. Se REPROVOU:
             *
             * Remove o progresso dos materiais
             * pertencentes ao módulo da avaliação.
             */

            if (!aprovado) {

                const materiaisModulo =
                    await tx.mat_material.findMany({

                        where: {

                            mod_id:
                                tentativa.ava_avaliacao.modulo.mod_id

                        },

                        select: {

                            mat_id: true

                        }

                    });


                const materialIds =
                    materiaisModulo.map(
                        material => material.mat_id
                    );


                /*
                 * Remove somente os materiais desse módulo
                 * da matrícula desse aluno.
                 */

                if (materialIds.length > 0) {

                    await tx.pro_progresso.deleteMany({

                        where: {

                            mac_id: matricula.mac_id,

                            mat_id: {
                                in: materialIds
                            }

                        }

                    });

                }


                /*
                 * 7. Recalcula o progresso geral do curso
                 */

                const totalMateriais =
                    await tx.mat_material.count({

                        where: {

                            mod_modulo: {
                                cur_id: matricula.cur_id
                            }

                        }

                    });


                const materiaisConcluidos =
                    await tx.pro_progresso.count({

                        where: {

                            mac_id: matricula.mac_id

                        }

                    });


                const progresso =
                    totalMateriais === 0
                        ? 0
                        : Number(
                            (
                                (materiaisConcluidos /
                                    totalMateriais) *
                                100
                            ).toFixed(2)
                        );


                /*
                 * 8. Salva o novo progresso na matrícula
                 */

                await tx.mac_matricula.update({

                    where: {

                        mac_id: matricula.mac_id

                    },

                    data: {

                        mac_progresso: progresso

                    }

                });


                /*
                 * 9. Finaliza a tentativa
                 */

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

                    total: questoesTentativa.length,

                    progresso,

                    aprovado: false

                };

            }


            /*
             * 10. Se foi aprovado:
             *
             * Mantém os materiais e o progresso atual.
             */

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

                total: questoesTentativa.length,

                progresso: matricula.mac_progresso,

                aprovado: true

            };

        });

    }

    async buscarResultadoTentativa(tentativaId: number) {

        const tentativa =
            await this.prisma.ten_tentativa.findUnique({

                where: {
                    ten_id: tentativaId,
                },

                include: {

                    ava_avaliacao: {
                        include: {
                            modulo: {
                                select: {
                                    mod_id: true,
                                    mod_titulo: true,
                                },
                            },
                        },
                    },

                    tenQuestaos: {
                        include: {
                            questao: {
                                include: {
                                    alternativa: true,
                                },
                            },
                        },
                    },

                    resRespostas: true,
                },
            });


        if (!tentativa) {

            throw new NotFoundException(
                "Tentativa não encontrada."
            );

        }


        /*
         * Monta o resultado de cada questão
         */

        const respostas =
            tentativa.tenQuestaos.map((item) => {


                /*
                 * Procura a resposta dada pelo aluno
                 */

                const respostaAluno =
                    tentativa.resRespostas.find(
                        resposta =>
                            resposta.que_id === item.que_id
                    );


                /*
                 * Encontra a alternativa correta
                 */

                const alternativaCorreta =
                    item.questao.alternativa.find(
                        alternativa =>
                            alternativa.alt_correta === true
                    );


                /*
                 * Encontra a alternativa escolhida
                 */

                const alternativaSelecionada =
                    respostaAluno
                        ? item.questao.alternativa.find(
                            alternativa =>
                                alternativa.alt_id ===
                                respostaAluno.alt_id
                        )
                        : null;


                /*
                 * Verifica se acertou
                 *
                 * Se não respondeu, automaticamente é false.
                 */

                const correta =
                    !!respostaAluno &&
                    respostaAluno.alt_id ===
                    alternativaCorreta?.alt_id;


                return {

                    questaoId:
                        item.questao.que_id,

                    pergunta:
                        item.questao.que_texto,


                    alternativaSelecionada:
                        alternativaSelecionada
                            ? {

                                id:
                                    alternativaSelecionada.alt_id,

                                texto:
                                    alternativaSelecionada.alt_texto,

                            }
                            : null,


                    alternativaCorreta:
                        alternativaCorreta
                            ? {

                                id:
                                    alternativaCorreta.alt_id,

                                texto:
                                    alternativaCorreta.alt_texto,

                            }
                            : null,


                    correta,

                };

            });


        /*
         * Retorno utilizado pelo frontend
         */

        return {

            tentativaId:
                tentativa.ten_id,


            avaliacao: {

                id:
                    tentativa.ava_avaliacao.ava_id,

                titulo:
                    tentativa.ava_avaliacao.ava_titulo,

            },


            modulo: {

                id:
                    tentativa.ava_avaliacao.modulo.mod_id,

                titulo:
                    tentativa.ava_avaliacao.modulo.mod_titulo,

            },


            nota:
                tentativa.ten_nota,


            acertos:
                tentativa.ten_acertos,


            total:
                tentativa.ten_total_questoes,


            aprovado:
                tentativa.ten_nota >= 7.5,


            dataInicio:
                tentativa.ten_dataInicio,


            dataFim:
                tentativa.ten_dataFim,


            respostas,

        };

    }

    async solicitarRevisao(
        tentativaId: number,
        usuarioId: number,
    ) {

        const tentativa =
            await this.prisma.ten_tentativa.findUnique({

                where: {
                    ten_id: tentativaId,
                },

                include: {

                    ava_avaliacao: true,

                },

            });


        if (!tentativa) {

            throw new NotFoundException(
                "Tentativa não encontrada."
            );

        }


        /*
         * Verifica se pertence ao aluno
         */
        if (
            tentativa.usu_id !== usuarioId
        ) {

            throw new BadRequestException(
                "Essa tentativa não pertence ao usuário."
            );

        }


        /*
         * Só pode solicitar depois de finalizar
         */
        if (!tentativa.ten_concluida) {

            throw new BadRequestException(
                "A tentativa ainda não foi finalizada."
            );

        }


        /*
         * Só pode solicitar se reprovado
         */
        if (
            tentativa.ten_nota >= 7.5
        ) {

            throw new BadRequestException(
                "Não é possível solicitar uma nova tentativa após aprovação."
            );

        }


        /*
         * Verifica se já existe solicitação
         */
        const existente =
            await this.prisma.rev_revisao_avaliacao.findFirst({

                where: {

                    ten_id:
                        tentativaId,

                    rev_status: {
                        in: [
                            "PENDENTE",
                            "APROVADA",
                        ],
                    },

                },

            });


        if (existente) {

            throw new BadRequestException(
                existente.rev_status === "PENDENTE"
                    ? "Já existe uma solicitação pendente."
                    : "Essa tentativa já possui autorização para uma nova realização."
            );

        }


        /*
         * Cria solicitação
         */
        return this.prisma.rev_revisao_avaliacao.create({

            data: {

                ten_id:
                    tentativa.ten_id,

                usu_id:
                    tentativa.usu_id,

                ava_id:
                    tentativa.ava_avaliacao.ava_id,

                rev_status:
                    "PENDENTE",

            },

        });

    }

    async qtdTentativas(usuarioId: number, avaliacaoId: number) {

        const qtd =
            await this.prisma.ten_tentativa.count({
                where: {
                    usu_id: usuarioId,
                    ava_id: avaliacaoId,
                },
            });
        return qtd;

    }
}
