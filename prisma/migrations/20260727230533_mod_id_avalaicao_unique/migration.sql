/*
  Warnings:

  - A unique constraint covering the columns `[mod_id]` on the table `ava_avaliacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ava_avaliacao_mod_id_key" ON "ava_avaliacao"("mod_id");
