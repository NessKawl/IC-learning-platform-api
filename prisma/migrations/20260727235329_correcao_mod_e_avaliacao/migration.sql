/*
  Warnings:

  - Added the required column `ten_acertos` to the `ten_tentativa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ten_total_questoes` to the `ten_tentativa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ten_tentativa" ADD COLUMN     "ten_acertos" INTEGER NOT NULL,
ADD COLUMN     "ten_concluida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ten_total_questoes" INTEGER NOT NULL;
