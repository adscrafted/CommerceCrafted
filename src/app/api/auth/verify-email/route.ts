import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/tokens'
import { emailService } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const { email, valid } = await verifyEmailToken(token)

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true }
    })

    // Send welcome email
    if (user) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.name || undefined)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const { email, valid } = await verifyEmailToken(token)

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true }
    })

    // Send welcome email
    if (user) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.name || undefined)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}