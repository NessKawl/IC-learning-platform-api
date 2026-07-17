/*
  Warnings:

  - You are about to drop the column `pro_status` on the `pro_progresso` table. All the data in the column will be lost.
  - You are about to drop the column `usu_id` on the `pro_progresso` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mac_id,mat_id]` on the table `pro_progresso` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mac_id` to the `pro_progresso` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pro_progresso" DROP CONSTRAINT "pro_progresso_usu_id_fkey";

-- AlterTable
ALTER TABLE "pro_progresso" DROP COLUMN "pro_status",
DROP COLUMN "usu_id",
ADD COLUMN     "concluidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mac_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pro_progresso_mac_id_mat_id_key" ON "pro_progresso"("mac_id", "mat_id");

-- AddForeignKey
ALTER TABLE "pro_progresso" ADD CONSTRAINT "pro_progresso_mac_id_fkey" FOREIGN KEY ("mac_id") REFERENCES "mac_matricula"("mac_id") ON DELETE RESTRICT ON UPDATE CASCADE;
