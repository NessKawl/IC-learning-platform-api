-- CreateEnum
CREATE TYPE "revStatus" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "rev_revisao_avaliacao" (
    "rev_id" SERIAL NOT NULL,
    "ten_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "ava_id" INTEGER NOT NULL,
    "rev_status" "revStatus" NOT NULL DEFAULT 'PENDENTE',
    "rev_motivo" TEXT,
    "rev_resposta" TEXT,
    "rev_data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rev_data_analise" TIMESTAMP(3),

    CONSTRAINT "rev_revisao_avaliacao_pkey" PRIMARY KEY ("rev_id")
);

-- CreateIndex
CREATE INDEX "rev_revisao_avaliacao_usu_id_idx" ON "rev_revisao_avaliacao"("usu_id");

-- CreateIndex
CREATE INDEX "rev_revisao_avaliacao_ava_id_idx" ON "rev_revisao_avaliacao"("ava_id");

-- CreateIndex
CREATE INDEX "rev_revisao_avaliacao_ten_id_idx" ON "rev_revisao_avaliacao"("ten_id");

-- CreateIndex
CREATE INDEX "rev_revisao_avaliacao_rev_status_idx" ON "rev_revisao_avaliacao"("rev_status");

-- AddForeignKey
ALTER TABLE "rev_revisao_avaliacao" ADD CONSTRAINT "rev_revisao_avaliacao_ten_id_fkey" FOREIGN KEY ("ten_id") REFERENCES "ten_tentativa"("ten_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rev_revisao_avaliacao" ADD CONSTRAINT "rev_revisao_avaliacao_usu_id_fkey" FOREIGN KEY ("usu_id") REFERENCES "usu_usuario"("usu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rev_revisao_avaliacao" ADD CONSTRAINT "rev_revisao_avaliacao_ava_id_fkey" FOREIGN KEY ("ava_id") REFERENCES "ava_avaliacao"("ava_id") ON DELETE RESTRICT ON UPDATE CASCADE;
