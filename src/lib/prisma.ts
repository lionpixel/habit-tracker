// ─────────────────────────────────────────────
//  Prisma client — preparado para integração
//  Descomente quando adicionar Prisma ao projeto:
//    npm install prisma @prisma/client
//    npx prisma init
//  e configure o schema em prisma/schema.prisma
// ─────────────────────────────────────────────

/*
import { PrismaClient } from '@prisma/client'

declare global {
  // Evita múltiplas instâncias em dev com hot reload
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
*/

// Placeholder — will be replaced with real Prisma client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = null as unknown as any
