/*
  Warnings:

  - You are about to drop the column `ventaId` on the `FacturaFarmacia` table. All the data in the column will be lost.
  - You are about to drop the column `registradoPor` on the `VentaFarmacia` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `VentaFarmacia` table. All the data in the column will be lost.
  - Added the required column `registradoPor` to the `FacturaFarmacia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facturaId` to the `VentaFarmacia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `VentaFarmacia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FacturaFarmacia" DROP CONSTRAINT "FacturaFarmacia_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "VentaFarmacia" DROP CONSTRAINT "VentaFarmacia_registradoPor_fkey";

-- DropIndex
DROP INDEX "FacturaFarmacia_ventaId_key";

-- AlterTable
ALTER TABLE "FacturaFarmacia" DROP COLUMN "ventaId",
ADD COLUMN     "pacienteId" INTEGER,
ADD COLUMN     "registradoPor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VentaFarmacia" DROP COLUMN "registradoPor",
DROP COLUMN "total",
ADD COLUMN     "facturaId" INTEGER NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE INDEX "FacturaFarmacia_pacienteId_idx" ON "FacturaFarmacia"("pacienteId");

-- CreateIndex
CREATE INDEX "VentaFarmacia_facturaId_idx" ON "VentaFarmacia"("facturaId");

-- AddForeignKey
ALTER TABLE "FacturaFarmacia" ADD CONSTRAINT "FacturaFarmacia_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaFarmacia" ADD CONSTRAINT "FacturaFarmacia_registradoPor_fkey" FOREIGN KEY ("registradoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaFarmacia" ADD CONSTRAINT "VentaFarmacia_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "FacturaFarmacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
