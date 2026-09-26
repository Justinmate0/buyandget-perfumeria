# Buy&Get

Perfumería en línea con tres líneas de fragancias: **Hombre**, **Mujer** y **Niños**. La tienda opera en Ecuador (USD, ruta `/ec`) y en Europa (EUR).

## Tecnologías

- Monorepo con **pnpm** y Turborepo
- **Medusa v2** en `apps/backend` (API y Admin)
- **Next.js 15** en `apps/storefront`
- **Supabase** usado únicamente como Postgres, a través del Session pooler

## Arquitectura

```text
Storefront (Next.js, puerto 8000)
        |
        v
Backend Medusa (puerto 9000, Admin en /app)
        |
        v
Supabase Postgres (Session pooler, puerto 5432)
```

Supabase entra solo como base de datos. Medusa abre una conexión Postgres con `DATABASE_URL`. No se usa `supabase-js`, ni Supabase Auth, ni Row Level Security: la autenticación de clientes y del admin la resuelve Medusa, y el usuario de la base es el del pooler, no un rol expuesto al navegador.

Tampoco hay Redis. Medusa arranca con el bus de eventos y el lock en memoria. Sirve para desarrollar en una sola máquina. Al reiniciar el backend, la sesión del Admin no se conserva y hay que volver a entrar.

## Requisitos

- Node.js 22
- pnpm 10 o superior (el repo fija `pnpm@12.5.1`)
- Un proyecto de Supabase con Postgres

## Instalación

1. Crea un proyecto en [Supabase](https://supabase.com). No actives Auth ni RLS para esta tienda: solo se usa la base.
2. En el proyecto, abre **Connect** y copia el connection string del **Session pooler** (puerto **5432**, host `*.pooler.supabase.com`). No uses el puerto 6543 del Transaction pooler.
3. Copia los ejemplos de entorno y rellena valores reales solo en tu máquina:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/storefront/.env.example apps/storefront/.env.local
```

En Windows (PowerShell):

```powershell
Copy-Item apps\backend\.env.example apps\backend\.env
Copy-Item apps\storefront\.env.example apps\storefront\.env.local
```

4. En `apps/backend/.env`, pega el connection string y déjalo con `?sslmode=no-verify`. Genera `JWT_SECRET` y `COOKIE_SECRET` largos y distintos. Ajusta los CORS si cambias los puertos.
5. Instala dependencias desde la raíz `store`:

```bash
pnpm install
```

6. Migraciones, datos base y usuario admin, desde `apps/backend`:

```bash
cd apps/backend
pnpm exec medusa db:migrate
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts
pnpm exec medusa user -e admin@buyandget.com -p tu_password
```

7. Arranca el backend (`pnpm dev` en `apps/backend`) y entra al Admin en [http://localhost:9000/app](http://localhost:9000/app). Crea la región **Ecuador** con moneda **USD** y un envío habilitado para la tienda. La región Europa (EUR) viene con el seed base.
8. Carga el catálogo de perfumes (el script es idempotente: se puede volver a ejecutar):

```bash
pnpm exec medusa exec ./src/scripts/seed-perfumes.ts
```

9. En el Admin, abre **Settings → Publishable API Keys**, copia la clave y pégala en `apps/storefront/.env.local` como `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Cómo correr el proyecto

Desde `apps/backend`:

```bash
pnpm dev
```

- API: [http://localhost:9000](http://localhost:9000)
- Admin: [http://localhost:9000/app](http://localhost:9000/app)

Desde `apps/storefront`:

```bash
pnpm dev
```

- Tienda: [http://localhost:8000/ec](http://localhost:8000/ec)

En Windows, si un antivirus intercepta TLS, arranca el storefront con:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
pnpm dev
```

No hace falta levantar Redis.

## Seguridad

Los secretos viven solo en `apps/backend/.env` y `apps/storefront/.env.local`. Esos archivos están en `.gitignore`. El repositorio solo incluye `apps/backend/.env.example` y `apps/storefront/.env.example`, con usuarios, contraseñas y claves de ejemplo. No subas connection strings, `JWT_SECRET`, `COOKIE_SECRET` ni la publishable key real.

## Decisiones técnicas

- **Session pooler (5432)** en lugar del Transaction pooler: Medusa mantiene sesiones y migraciones que no conviven bien con el modo transacción del puerto 6543.
- **`sslmode=no-verify`** en `DATABASE_URL` y **`rejectUnauthorized: false`** en `databaseDriverOptions` de `medusa-config.ts`: la cadena del pooler de Supabase usa un certificado que Node, en esta instalación, no valida contra el almacén por defecto. La conexión sigue yendo por TLS; solo se omite la verificación del certificado.
- **Sin Redis:** menos infraestructura local. El Admin pide login de nuevo al reiniciar el backend.
- **Sin cliente de Supabase:** el storefront solo habla con la API de Medusa. La base no se expone al navegador.

## Solución de problemas

- **Error de certificado al conectar a Supabase.** Confirma `?sslmode=no-verify` en `DATABASE_URL` y `ssl: { rejectUnauthorized: false }` en `apps/backend/medusa-config.ts`.
- **La tienda no muestra productos** después de un seed o un cambio de datos. Para el servidor de desarrollo del storefront y borra `apps/storefront/.next`, luego vuelve a ejecutar `pnpm dev`. Next guarda las respuestas de Medusa en esa caché.
- **El Admin cierra la sesión al reiniciar.** Es esperado: no hay Redis para guardar la sesión. Vuelve a entrar en `/app`.
- **`pnpm` o Node fallan con errores de certificado en Windows** (antivirus). Ejecuta el comando con `NODE_OPTIONS=--use-system-ca`.
- **Demasiadas conexiones en Supabase.** El seed reintenta solo si el pooler responde que no quedan clientes. No lances varios `pnpm dev` del backend a la vez.
