/*
  Warnings:

  - Added the required column `cur_capa_url` to the `cur_curso` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "usuStatus" AS ENUM ('PENDENTE', 'ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "cur_curso" ADD COLUMN     "cur_capa_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usu_usuario" ADD COLUMN     "usu_proposta" TEXT,
ADD COLUMN     "usu_status" "usuStatus" NOT NULL DEFAULT 'ATIVO';
