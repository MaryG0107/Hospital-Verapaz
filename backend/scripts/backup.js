// RNF-03: respaldo periodico de la base de datos, para no depender de que
// nadie se acuerde de hacerlo a mano (y para que un error como un
// "migrate reset" accidental no vuelva a borrar datos reales sin remedio).
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUPS_DIR = path.join(__dirname, "..", "backups");

const RUTAS_PG_DUMP_WINDOWS = [
  "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe",
  "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe",
  "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
];

function encontrarPgDump() {
  // Si esta en el PATH, "pg_dump" a secas funciona en cualquier sistema operativo
  const enPath = spawnSync("pg_dump", ["--version"]);
  if (enPath.status === 0) return "pg_dump";

  for (const ruta of RUTAS_PG_DUMP_WINDOWS) {
    if (existsSync(ruta)) return ruta;
  }
  return null;
}

function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("No se encontro DATABASE_URL en .env");
    process.exit(1);
  }

  const pgDump = encontrarPgDump();
  if (!pgDump) {
    console.error("No se encontro pg_dump. Instala las herramientas de cliente de PostgreSQL o agrega su carpeta bin al PATH.");
    process.exit(1);
  }

  if (!existsSync(BACKUPS_DIR)) mkdirSync(BACKUPS_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archivo = path.join(BACKUPS_DIR, `verapaz_${timestamp}.sql`);

  console.log(`Generando respaldo en ${archivo} ...`);
  const resultado = spawnSync(pgDump, [databaseUrl, "-f", archivo], { stdio: "inherit" });

  if (resultado.status !== 0) {
    console.error("El respaldo fallo.");
    process.exit(resultado.status || 1);
  }
  console.log("Respaldo completado.");
}

main();
