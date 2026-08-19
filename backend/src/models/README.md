Este proyecto usa Prisma como ORM (ver `backend/prisma/schema.prisma`),
por lo que no se manejan archivos de modelo manuales aqui.

Si el equipo prefiere no usar Prisma y escribir SQL directo con el
paquete `pg`, este es el lugar para colocar los modelos/queries por
entidad (ej. `paciente.model.js`, `usuario.model.js`).
