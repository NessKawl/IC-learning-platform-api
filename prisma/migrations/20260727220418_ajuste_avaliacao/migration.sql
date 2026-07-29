/*
  Warnings:

  - You are about to drop the column `cur_id` on the `ava_avaliacao` table. All the data in the column will be lost.
  - Added the required column `mod_id` to the `ava_avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ava_avaliacao" DROP CONSTRAINT "ava_avaliacao_cur_id_fkey";

-- AlterTable
ALTER TABLE "ava_avaliacao" DROP COLUMN "cur_id",
ADD COLUMN     "mod_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ava_avaliacao" ADD CONSTRAINT "ava_avaliacao_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "mod_modulo"("mod_id") ON DELETE RESTRICT ON UPDATE CASCADE;
