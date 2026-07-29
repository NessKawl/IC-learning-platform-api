-- CreateTable
CREATE TABLE "ten_questao" (
    "tq_id" SERIAL NOT NULL,
    "ten_id" INTEGER NOT NULL,
    "que_id" INTEGER NOT NULL,

    CONSTRAINT "ten_questao_pkey" PRIMARY KEY ("tq_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ten_questao_ten_id_que_id_key" ON "ten_questao"("ten_id", "que_id");

-- AddForeignKey
ALTER TABLE "ten_questao" ADD CONSTRAINT "ten_questao_ten_id_fkey" FOREIGN KEY ("ten_id") REFERENCES "ten_tentativa"("ten_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ten_questao" ADD CONSTRAINT "ten_questao_que_id_fkey" FOREIGN KEY ("que_id") REFERENCES "que_questao"("que_id") ON DELETE RESTRICT ON UPDATE CASCADE;
