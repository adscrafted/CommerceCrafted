import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
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

    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        subscription_tier,
        subscription_expires_at,
        email_verified,
        email_subscribed,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `)
      .eq('id', session.user.id)
      .single()

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

    const { data: currentUser } = await supabase
      .from('users')
      .select('email, email_verified')
      .eq('id', session.user.id)
      .single()

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
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .maybeSingle()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        )
      }

      updateData.email = validatedData.email
      updateData.email_verified = null // Reset verification status
      requiresEmailVerification = true
    }

    // Handle newsletter subscription
    if (validatedData.emailSubscribed !== undefined) {
      updateData.email_subscribed = validatedData.emailSubscribed
      
      // Update newsletter subscription record
      try {
        if (validatedData.emailSubscribed) {
          await supabase.from('newsletter_subscriptions').upsert({
            email: validatedData.email || currentUser.email,
            user_id: session.user.id,
            subscription_type: 'daily_deals',
            subscribe_source: 'profile_update',
            unsubscribe_token: `unsubscribe_${session.user.id}_${Date.now()}`,
            is_active: true
          })
        } else {
          await supabase.from('newsletter_subscriptions')
            .update({ is_active: false })
            .eq('email', validatedData.email || currentUser.email)
        }
      } catch (error) {
        console.error('Newsletter subscription update failed:', error)
        // Don't fail the entire request for newsletter issues
      }
    }

    // Update user profile
    const { data: updatedUser } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select(`
        id,
        email,
        name,
        role,
        subscription_tier,
        subscription_expires_at,
        email_verified,
        email_subscribed,
        updated_at
      `)
      .single()

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