// server-only — NUNCA importar em 'use client'
// Criptografia AES-256-GCM para armazenar API keys dos usuários no Supabase.
// Formato do output: "iv_hex:authTag_hex:encrypted_hex"

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY não configurada. ' +
      'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" ' +
      'e adicione ao .env.local e às Variables da Vercel.',
    )
  }
  if (raw.length !== 64) {
    throw new Error('ENCRYPTION_KEY deve ter exatamente 64 caracteres hex (32 bytes).')
  }
  return Buffer.from(raw, 'hex')
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv  = randomBytes(16)

  const cipher    = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag   = cipher.getAuthTag()

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':')
}

export function decrypt(encryptedData: string): string {
  const key = getKey()
  const parts = encryptedData.split(':')
  if (parts.length !== 3) throw new Error('Formato inválido de dado criptografado.')

  const [ivHex, authTagHex, encryptedHex] = parts
  const iv        = Buffer.from(ivHex, 'hex')
  const authTag   = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
