import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  subscribeNewsletter: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, subscribeNewsletter } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
        subscriptionTier: 'free',
        emailSubscribed: subscribeNewsletter,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
      }
    })

    // Create newsletter subscription if opted in
    if (subscribeNewsletter) {
      try {
        await prisma.newsletterSubscription.create({
          data: {
            email,
            userId: user.id,
            subscriptionType: 'daily_deals',
            subscribeSource: 'signup',
            unsubscribeToken: `unsubscribe_${user.id}_${Date.now()}`,
          }
        })
      } catch (error) {
        // Newsletter subscription is not critical, log but don't fail
        console.error('Failed to create newsletter subscription:', error)
      }
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    
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