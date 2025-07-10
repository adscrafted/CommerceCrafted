import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await supabase
    .from('email_verification_tokens')
    .delete()
    .eq('email', email)

  const token = generateSecureToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await supabase.from('email_verification_tokens').insert({
    email,
    token,
    expires: expires.toISOString(),
  })

  return token
}

export async function verifyEmailToken(token: string): Promise<{ email: string; valid: boolean }> {
  const { data: verificationToken } = await supabase
    .from('email_verification_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!verificationToken || verificationToken.used || new Date(verificationToken.expires) < new Date()) {
    return { email: '', valid: false }
  }

  // Mark token as used
  await supabase
    .from('email_verification_tokens')
    .update({ used: true })
    .eq('id', verificationToken.id)

  // Mark user email as verified
  await supabase
    .from('users')
    .update({ email_verified: new Date().toISOString() })
    .eq('email', verificationToken.email)

  return { email: verificationToken.email, valid: true }
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  // Check if user exists
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!user) {
    return null
  }

  // Delete any existing tokens for this email
  await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('email', email)

  const token = generateSecureToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await supabase.from('password_reset_tokens').insert({
    email,
    token,
    expires: expires.toISOString(),
  })

  return token
}

export async function verifyPasswordResetToken(token: string): Promise<{ email: string; valid: boolean }> {
  const { data: resetToken } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!resetToken || resetToken.used || new Date(resetToken.expires) < new Date()) {
    return { email: '', valid: false }
  }

  return { email: resetToken.email, valid: true }
}

export async function markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
  try {
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)
    return true
  } catch {
    return false
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date()
  
  await Promise.all([
    supabase
      .from('email_verification_tokens')
      .delete()
      .lt('expires', now.toISOString()),
    supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires', now.toISOString())
  ])
}