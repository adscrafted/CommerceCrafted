import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email }
  })

  const token = generateSecureToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    }
  })

  return token
}

export async function verifyEmailToken(token: string): Promise<{ email: string; valid: boolean }> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken || verificationToken.used || verificationToken.expires < new Date()) {
    return { email: '', valid: false }
  }

  // Mark token as used
  await prisma.emailVerificationToken.update({
    where: { id: verificationToken.id },
    data: { used: true }
  })

  // Mark user email as verified
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() }
  })

  return { email: verificationToken.email, valid: true }
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return null
  }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email }
  })

  const token = generateSecureToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    }
  })

  return token
}

export async function verifyPasswordResetToken(token: string): Promise<{ email: string; valid: boolean }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
    return { email: '', valid: false }
  }

  return { email: resetToken.email, valid: true }
}

export async function markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
  try {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true }
    })
    return true
  } catch {
    return false
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date()
  
  await Promise.all([
    prisma.emailVerificationToken.deleteMany({
      where: { expires: { lt: now } }
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: now } }
    })
  ])
}