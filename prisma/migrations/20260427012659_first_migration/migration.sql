-- CreateEnum
CREATE TYPE "avaTipo" AS ENUM ('QUIZ', 'PROVA');

-- CreateEnum
CREATE TYPE "queTipo" AS ENUM ('DISSERTATIVA', 'OBJETIVA');

-- CreateTable
CREATE TABLE "tiu_tipo_usuario" (
    "tiu_id" SERIAL NOT NULL,
    "tiu_nome" TEXT NOT NULL,

    CONSTRAINT "tiu_tipo_usuario_pkey" PRIMARY KEY ("tiu_id")
);

-- CreateTable
CREATE TABLE "usu_usuario" (
    "usu_id" SERIAL NOT NULL,
    "usu_nome" TEXT NOT NULL,
    "usu_email" TEXT NOT NULL,
    "usu_senha" TEXT NOT NULL,
    "tiu_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usu_usuario_pkey" PRIMARY KEY ("usu_id")
);

-- CreateTable
CREATE TABLE "cur_curso" (
    "cur_id" SERIAL NOT NULL,
    "cur_titulo" TEXT NOT NULL,
    "cur_descricao" TEXT NOT NULL,
    "professor_id" INTEGER NOT NULL,

    CONSTRAINT "cur_curso_pkey" PRIMARY KEY ("cur_id")
);

-- CreateTable
CREATE TABLE "mod_modulo" (
    "mod_id" SERIAL NOT NULL,
    "mod_titulo" TEXT NOT NULL,
    "mod_descricao" TEXT NOT NULL,
    "cur_id" INTEGER NOT NULL,

    CONSTRAINT "mod_modulo_pkey" PRIMARY KEY ("mod_id")
);

-- CreateTable
CREATE TABLE "tim_tipo_matarial" (
    "tim_id" SERIAL NOT NULL,
    "tim_nome" TEXT NOT NULL,

    CONSTRAINT "tim_tipo_matarial_pkey" PRIMARY KEY ("tim_id")
);

-- CreateTable
CREATE TABLE "mat_material" (
    "mat_id" SERIAL NOT NULL,
    "mat_titulo" TEXT NOT NULL,
    "mat_url" TEXT NOT NULL,
    "mat_ordem" INTEGER NOT NULL,
    "mod_id" INTEGER NOT NULL,
    "tim_id" INTEGER NOT NULL,

    CONSTRAINT "mat_material_pkey" PRIMARY KEY ("mat_id")
);

-- CreateTable
CREATE TABLE "pro_progresso" (
    "pro_id" SERIAL NOT NULL,
    "pro_status" TEXT NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "mat_id" INTEGER NOT NULL,

    CONSTRAINT "pro_progresso_pkey" PRIMARY KEY ("pro_id")
);

-- CreateTable
CREATE TABLE "ava_avaliacao" (
    "ava_id" SERIAL NOT NULL,
    "ava_titulo" TEXT NOT NULL,
    "ava_tipo" "avaTipo" NOT NULL,
    "ava_tempo_limite" INTEGER NOT NULL,
    "proctoring" BOOLEAN NOT NULL,
    "cur_id" INTEGER NOT NULL,

    CONSTRAINT "ava_avaliacao_pkey" PRIMARY KEY ("ava_id")
);

-- CreateTable
CREATE TABLE "que_questao" (
    "que_id" SERIAL NOT NULL,
    "que_texto" TEXT NOT NULL,
    "que_tipo" "queTipo" NOT NULL,
    "ava_id" INTEGER NOT NULL,

    CONSTRAINT "que_questao_pkey" PRIMARY KEY ("que_id")
);

-- CreateTable
CREATE TABLE "alt_alternativa" (
    "alt_id" SERIAL NOT NULL,
    "alt_texto" TEXT NOT NULL,
    "que_id" INTEGER NOT NULL,
    "alt_correta" BOOLEAN NOT NULL,

    CONSTRAINT "alt_alternativa_pkey" PRIMARY KEY ("alt_id")
);

-- CreateTable
CREATE TABLE "ten_tentativa" (
    "ten_id" SERIAL NOT NULL,
    "ten_nota" DOUBLE PRECISION NOT NULL,
    "ten_dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ten_dataFim" TIMESTAMP(3) NOT NULL,
    "ava_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,

    CONSTRAINT "ten_tentativa_pkey" PRIMARY KEY ("ten_id")
);

-- CreateTable
CREATE TABLE "res_resposta" (
    "res_id" SERIAL NOT NULL,
    "res_texto" TEXT,
    "ten_id" INTEGER NOT NULL,
    "que_id" INTEGER NOT NULL,
    "alt_id" INTEGER,

    CONSTRAINT "res_resposta_pkey" PRIMARY KEY ("res_id")
);

-- CreateTable
CREATE TABLE "mac_matricula" (
    "mac_id" SERIAL NOT NULL,
    "mac_data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mac_progresso" DOUBLE PRECISION NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "cur_id" INTEGER NOT NULL,

    CONSTRAINT "mac_matricula_pkey" PRIMARY KEY ("mac_id")
);

-- AddForeignKey
ALTER TABLE "usu_usuario" ADD CONSTRAINT "usu_usuario_tiu_id_fkey" FOREIGN KEY ("tiu_id") REFERENCES "tiu_tipo_usuario"("tiu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cur_curso" ADD CONSTRAINT "cur_curso_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "usu_usuario"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mod_modulo" ADD CONSTRAINT "mod_modulo_cur_id_fkey" FOREIGN KEY ("cur_id") REFERENCES "cur_curso"("cur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mat_material" ADD CONSTRAINT "mat_material_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "mod_modulo"("mod_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mat_material" ADD CONSTRAINT "mat_material_tim_id_fkey" FOREIGN KEY ("tim_id") REFERENCES "tim_tipo_matarial"("tim_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_progresso" ADD CONSTRAINT "pro_progresso_usu_id_fkey" FOREIGN KEY ("usu_id") REFERENCES "usu_usuario"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_progresso" ADD CONSTRAINT "pro_progresso_mat_id_fkey" FOREIGN KEY ("mat_id") REFERENCES "mat_material"("mat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ava_avaliacao" ADD CONSTRAINT "ava_avaliacao_cur_id_fkey" FOREIGN KEY ("cur_id") REFERENCES "cur_curso"("cur_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "que_questao" ADD CONSTRAINT "que_questao_ava_id_fkey" FOREIGN KEY ("ava_id") REFERENCES "ava_avaliacao"("ava_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alt_alternativa" ADD CONSTRAINT "alt_alternativa_que_id_fkey" FOREIGN KEY ("que_id") REFERENCES "que_questao"("que_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ten_tentativa" ADD CONSTRAINT "ten_tentativa_ava_id_fkey" FOREIGN KEY ("ava_id") REFERENCES "ava_avaliacao"("ava_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ten_tentativa" ADD CONSTRAINT "ten_tentativa_usu_id_fkey" FOREIGN KEY ("usu_id") REFERENCES "usu_usuario"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "res_resposta" ADD CONSTRAINT "res_resposta_ten_id_fkey" FOREIGN KEY ("ten_id") REFERENCES "ten_tentativa"("ten_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "res_resposta" ADD CONSTRAINT "res_resposta_que_id_fkey" FOREIGN KEY ("que_id") REFERENCES "que_questao"("que_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mac_matricula" ADD CONSTRAINT "mac_matricula_usu_id_fkey" FOREIGN KEY ("usu_id") REFERENCES "usu_usuario"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mac_matricula" ADD CONSTRAINT "mac_matricula_cur_id_fkey" FOREIGN KEY ("cur_id") REFERENCES "cur_curso"("cur_id") ON DELETE RESTRICT ON UPDATE CASCADE;
