import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSupabase } from '@/lib/supabase-server'
import { z } from 'zod'
import { createEmailVerificationToken } from '@/lib/tokens'
import { emailService } from '@/lib/email'

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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user (email not verified yet)
    const { data: user } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'USER',
        subscription_tier: 'free',
        email_subscribed: subscribeNewsletter,
        email_verified: null, // Will be set when email is verified
      })
      .select('id, name, email, role, subscription_tier, email_verified, created_at')
      .single()

    // Create newsletter subscription if opted in
    if (subscribeNewsletter) {
      try {
        await supabase.from('newsletter_subscriptions').insert({
          email,
          user_id: user.id,
          subscription_type: 'daily_deals',
          subscribe_source: 'signup',
          unsubscribe_token: `unsubscribe_${user.id}_${Date.now()}`,
        })
      } catch (error) {
        // Newsletter subscription is not critical, log but don't fail
        console.error('Failed to create newsletter subscription:', error)
      }
    }

    // Send email verification
    try {
      const verificationToken = await createEmailVerificationToken(email)
      await emailService.sendVerificationEmail(email, verificationToken, name)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Don't fail the signup if email sending fails
    }

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user,
        requiresVerification: true
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