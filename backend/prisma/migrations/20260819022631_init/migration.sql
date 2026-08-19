-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "puedeAutogenerarToken" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenTemporal" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "pacienteId" INTEGER,
    "emitidoPor" INTEGER NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenTemporal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "historiaClinica" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "dpi" TEXT NOT NULL,
    "direccion" TEXT,
    "lugarNacimiento" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "edad" INTEGER,
    "sexo" TEXT,
    "estadoCivil" TEXT,
    "ocupacion" TEXT,
    "religion" TEXT,
    "nacionalidad" TEXT,
    "nombreConyuge" TEXT,
    "nombrePadre" TEXT,
    "nombreMadre" TEXT,
    "contactoEmergencia" TEXT,
    "parentesco" TEXT,
    "referidoDe" TEXT,
    "medicoReferenteId" INTEGER,
    "serviciosSolicitados" TEXT,
    "impresionClinicaIngreso" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "fechaEgreso" TIMESTAMP(3),
    "diagnosticoEgresoCodigo" TEXT,
    "complicacionesCodigo" TEXT,
    "operacionesCodigo" TEXT,
    "condicionEgreso" TEXT,
    "autopsia" BOOLEAN,
    "causaMuerte" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroMaternidad" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "numeroHijo" INTEGER,
    "fecha" TIMESTAMP(3),
    "hora" TEXT,
    "sexo" TEXT,
    "condicionEgresoBebe" TEXT,

    CONSTRAINT "RegistroMaternidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnostico" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "textoCifrado" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "codigoCie" TEXT,
    "registradoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TratamientoItem" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "dosis" TEXT,
    "costo" DECIMAL(10,2) NOT NULL,
    "origen" TEXT NOT NULL,
    "facturado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TratamientoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receta" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "indicaciones" TEXT NOT NULL,
    "duracion" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicoReferente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT,
    "comisionQ" DECIMAL(10,2) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicoReferente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaHospital" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "costoHospital" DECIMAL(10,2) NOT NULL,
    "costoTratamiento" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "formaPago" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacturaHospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacturaFarmacia" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacturaFarmacia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicamentoInventario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT,
    "presentacion" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 10,
    "precioVenta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fechaVencimiento" TIMESTAMP(3),
    "proveedor" TEXT,

    CONSTRAINT "MedicamentoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" SERIAL NOT NULL,
    "medicamentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaFarmacia" (
    "id" SERIAL NOT NULL,
    "medicamentoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "registradoPor" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaFarmacia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BitacoraVisita" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BitacoraVisita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "TokenTemporal_token_key" ON "TokenTemporal"("token");

-- CreateIndex
CREATE INDEX "TokenTemporal_usuarioId_idx" ON "TokenTemporal"("usuarioId");

-- CreateIndex
CREATE INDEX "TokenTemporal_expiraEn_idx" ON "TokenTemporal"("expiraEn");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_historiaClinica_key" ON "Paciente"("historiaClinica");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dpi_key" ON "Paciente"("dpi");

-- CreateIndex
CREATE INDEX "Paciente_nombreCompleto_idx" ON "Paciente"("nombreCompleto");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroMaternidad_pacienteId_key" ON "RegistroMaternidad"("pacienteId");

-- CreateIndex
CREATE INDEX "Diagnostico_pacienteId_idx" ON "Diagnostico"("pacienteId");

-- CreateIndex
CREATE INDEX "TratamientoItem_pacienteId_idx" ON "TratamientoItem"("pacienteId");

-- CreateIndex
CREATE INDEX "Receta_pacienteId_idx" ON "Receta"("pacienteId");

-- CreateIndex
CREATE INDEX "FacturaHospital_pacienteId_idx" ON "FacturaHospital"("pacienteId");

-- CreateIndex
CREATE INDEX "FacturaHospital_creadoEn_idx" ON "FacturaHospital"("creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "FacturaFarmacia_ventaId_key" ON "FacturaFarmacia"("ventaId");

-- CreateIndex
CREATE INDEX "FacturaFarmacia_creadoEn_idx" ON "FacturaFarmacia"("creadoEn");

-- CreateIndex
CREATE INDEX "MedicamentoInventario_nombre_idx" ON "MedicamentoInventario"("nombre");

-- CreateIndex
CREATE INDEX "MovimientoInventario_medicamentoId_idx" ON "MovimientoInventario"("medicamentoId");

-- CreateIndex
CREATE INDEX "VentaFarmacia_medicamentoId_idx" ON "VentaFarmacia"("medicamentoId");

-- CreateIndex
CREATE INDEX "BitacoraVisita_pacienteId_idx" ON "BitacoraVisita"("pacienteId");

-- AddForeignKey
ALTER TABLE "TokenTemporal" ADD CONSTRAINT "TokenTemporal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTemporal" ADD CONSTRAINT "TokenTemporal_emitidoPor_fkey" FOREIGN KEY ("emitidoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTemporal" ADD CONSTRAINT "TokenTemporal_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_medicoReferenteId_fkey" FOREIGN KEY ("medicoReferenteId") REFERENCES "MedicoReferente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMaternidad" ADD CONSTRAINT "RegistroMaternidad_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostico" ADD CONSTRAINT "Diagnostico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostico" ADD CONSTRAINT "Diagnostico_registradoPor_fkey" FOREIGN KEY ("registradoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TratamientoItem" ADD CONSTRAINT "TratamientoItem_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receta" ADD CONSTRAINT "Receta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receta" ADD CONSTRAINT "Receta_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaHospital" ADD CONSTRAINT "FacturaHospital_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaFarmacia" ADD CONSTRAINT "FacturaFarmacia_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "VentaFarmacia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInventario" ADD CONSTRAINT "MovimientoInventario_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "MedicamentoInventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaFarmacia" ADD CONSTRAINT "VentaFarmacia_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "MedicamentoInventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaFarmacia" ADD CONSTRAINT "VentaFarmacia_registradoPor_fkey" FOREIGN KEY ("registradoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraVisita" ADD CONSTRAINT "BitacoraVisita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraVisita" ADD CONSTRAINT "BitacoraVisita_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
