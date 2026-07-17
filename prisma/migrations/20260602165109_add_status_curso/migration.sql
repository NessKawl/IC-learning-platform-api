-- CreateEnum
CREATE TYPE "CurStatus" AS ENUM ('PENDENTE', 'REJEITADO', 'ATIVO', 'INATIVO');

-- AlterTable
ALTER TABLE "cur_curso" ADD COLUMN     "cur_status" "CurStatus" NOT NULL DEFAULT 'PENDENTE';
