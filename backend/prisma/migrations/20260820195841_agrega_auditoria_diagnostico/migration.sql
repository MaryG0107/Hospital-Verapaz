-- CreateTable
CREATE TABLE "AccesoDiagnostico" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "viaToken" BOOLEAN NOT NULL DEFAULT false,
    "tokenId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccesoDiagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccesoDiagnostico_pacienteId_idx" ON "AccesoDiagnostico"("pacienteId");

-- CreateIndex
CREATE INDEX "AccesoDiagnostico_usuarioId_idx" ON "AccesoDiagnostico"("usuarioId");

-- CreateIndex
CREATE INDEX "AccesoDiagnostico_fecha_idx" ON "AccesoDiagnostico"("fecha");

-- AddForeignKey
ALTER TABLE "AccesoDiagnostico" ADD CONSTRAINT "AccesoDiagnostico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesoDiagnostico" ADD CONSTRAINT "AccesoDiagnostico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesoDiagnostico" ADD CONSTRAINT "AccesoDiagnostico_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "TokenTemporal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
