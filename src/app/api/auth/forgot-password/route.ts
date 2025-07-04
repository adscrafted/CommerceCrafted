import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPasswordResetToken } from '@/lib/tokens'
import { emailService } from '@/lib/email'
import { prisma } from '@/lib/prisma'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true, isActive: true }
    })

    // Always return success to prevent email enumeration
    // but only send email if user actually exists
    if (user && user.isActive) {
      try {
        const resetToken = await createPasswordResetToken(email)
        if (resetToken) {
          await emailService.sendPasswordResetEmail(email, resetToken, user.name || undefined)
        }
      } catch (error) {
        console.error('Failed to send password reset email:', error)
      }
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}