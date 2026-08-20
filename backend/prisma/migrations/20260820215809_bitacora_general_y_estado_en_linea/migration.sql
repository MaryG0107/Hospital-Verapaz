-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "ultimaActividad" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LogActividad" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogActividad_usuarioId_idx" ON "LogActividad"("usuarioId");

-- CreateIndex
CREATE INDEX "LogActividad_fecha_idx" ON "LogActividad"("fecha");

-- CreateIndex
CREATE INDEX "LogActividad_accion_idx" ON "LogActividad"("accion");

-- AddForeignKey
ALTER TABLE "LogActividad" ADD CONSTRAINT "LogActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
