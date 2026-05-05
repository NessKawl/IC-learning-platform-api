/*
  Warnings:

  - A unique constraint covering the columns `[usu_email]` on the table `usu_usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usu_usuario_usu_email_key" ON "usu_usuario"("usu_email");
