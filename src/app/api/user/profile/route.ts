import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createEmailVerificationToken } from '@/lib/tokens'
import { emailService } from '@/lib/email'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  emailSubscribed: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        emailVerified: true,
        emailSubscribed: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    let requiresEmailVerification = false

    // Handle name update
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }

    // Handle email update
    if (validatedData.email !== undefined && validatedData.email !== currentUser.email) {
      // Check if new email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        )
      }

      updateData.email = validatedData.email
      updateData.emailVerified = null // Reset verification status
      requiresEmailVerification = true
    }

    // Handle newsletter subscription
    if (validatedData.emailSubscribed !== undefined) {
      updateData.emailSubscribed = validatedData.emailSubscribed
      
      // Update newsletter subscription record
      try {
        if (validatedData.emailSubscribed) {
          await prisma.newsletterSubscription.upsert({
            where: { email: validatedData.email || currentUser.email },
            update: { isActive: true },
            create: {
              email: validatedData.email || currentUser.email,
              userId: session.user.id,
              subscriptionType: 'daily_deals',
              subscribeSource: 'profile_update',
              unsubscribeToken: `unsubscribe_${session.user.id}_${Date.now()}`,
            }
          })
        } else {
          await prisma.newsletterSubscription.updateMany({
            where: { email: validatedData.email || currentUser.email },
            data: { isActive: false }
          })
        }
      } catch (error) {
        console.error('Newsletter subscription update failed:', error)
        // Don't fail the entire request for newsletter issues
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        emailVerified: true,
        emailSubscribed: true,
        updatedAt: true,
      }
    })

    // Send verification email if email was changed
    if (requiresEmailVerification && validatedData.email) {
      try {
        const verificationToken = await createEmailVerificationToken(validatedData.email)
        await emailService.sendVerificationEmail(
          validatedData.email, 
          verificationToken, 
          validatedData.name || updatedUser.name || undefined
        )
      } catch (error) {
        console.error('Failed to send verification email:', error)
        // Don't fail the update, but let user know
      }
    }

    return NextResponse.json({
      message: requiresEmailVerification 
        ? 'Profile updated successfully. Please check your email to verify your new email address.'
        : 'Profile updated successfully',
      user: updatedUser,
      requiresEmailVerification
    })

  } catch (error) {
    console.error('Update profile error:', error)
    
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