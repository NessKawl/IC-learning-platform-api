-- AlterTable
ALTER TABLE "cur_curso" ADD COLUMN     "cur_carga_horaria_modulos" TEXT,
ADD COLUMN     "cur_conteudo_modulos" TEXT,
ADD COLUMN     "cur_forma_avaliacao" TEXT,
ADD COLUMN     "cur_n_modulos" TEXT,
ADD COLUMN     "cur_publico" TEXT;

-- AlterTable
ALTER TABLE "usu_usuario" ADD COLUMN     "usu_curriculo" TEXT,
ADD COLUMN     "usu_lattes" TEXT;
