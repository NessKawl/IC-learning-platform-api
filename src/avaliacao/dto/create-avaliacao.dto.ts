export class CreateAlternativaDto {
    texto!: string;
    correta!: boolean;
}

export class CreateQuestaoDto {
    texto!: string;
    alternativas!: CreateAlternativaDto[];
}

export class CreateAvaliacaoDto {
    ava_titulo!: string;
    ava_tipo!: "QUIZ" | "PROVA";
    ava_tempo_limite!: number;
    proctoring!: boolean;
    mod_id!: number;
    questoes!: CreateQuestaoDto[];
}

export class FinalizarProvaDto {
    tentativaId!: number;

    respostas!: {
        que_id: number;
        alt_id: number;
    }[];
}