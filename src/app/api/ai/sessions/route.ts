// AI Research Session Management API
// Handles conversation memory and session persistence

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { conversationManager } from '@/lib/conversation-manager'

// GET /api/ai/sessions - Get user's research sessions
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const includeMessages = searchParams.get('includeMessages') === 'true'

    if (sessionId) {
      // Get specific session
      const researchSession = conversationManager.getSession(sessionId)
      if (!researchSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      // Check if user owns the session
      if (researchSession.userId !== authUser.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      let response: any = researchSession

      if (includeMessages) {
        const messages = conversationManager.getConversationHistory(sessionId)
        response = {
          ...researchSession,
          messages
        }
      }

      return NextResponse.json(response)
    } else {
      // Get all sessions for user
      const userSessions = conversationManager.getUserSessions(authUser.id)
      
      // Sort by most recent first
      const sortedSessions = userSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      return NextResponse.json({
        sessions: sortedSessions,
        total: sortedSessions.length
      })
    }

  } catch (error) {
    console.error('Session API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve sessions',
        code: 'SESSION_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST /api/ai/sessions - Create a new research session
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sessionType, productId } = body

    // Validate session type
    const validTypes = ['product_validation', 'market_research', 'competitor_analysis', 'launch_strategy']
    if (!sessionType || !validTypes.includes(sessionType)) {
      return NextResponse.json(
        { error: 'Valid session type is required' },
        { status: 400 }
      )
    }

    // Create new session
    const newSession = conversationManager.createSession(
      authUser.id,
      sessionType,
      productId
    )

    return NextResponse.json(newSession, { status: 201 })

  } catch (error) {
    console.error('Session Creation Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        code: 'SESSION_CREATION_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/ai/sessions?sessionId=xxx - Delete a session
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get session ID from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get session and verify ownership
    const researchSession = conversationManager.getSession(sessionId)
    if (!researchSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (researchSession.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete session
    const deleted = conversationManager.deleteSession(sessionId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Session Deletion Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete session',
        code: 'SESSION_DELETION_ERROR'
      },
      { status: 500 }
    )
  }
}

// PUT /api/ai/sessions?sessionId=xxx - Update session (archive/unarchive)
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get session ID from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { action } = body

    // Get session and verify ownership
    const researchSession = conversationManager.getSession(sessionId)
    if (!researchSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (researchSession.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Handle different actions
    if (action === 'archive') {
      const archived = conversationManager.archiveSession(sessionId)
      if (!archived) {
        return NextResponse.json(
          { error: 'Failed to archive session' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Return updated session
    const updatedSession = conversationManager.getSession(sessionId)
    return NextResponse.json(updatedSession)

  } catch (error) {
    console.error('Session Update Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update session',
        code: 'SESSION_UPDATE_ERROR'
      },
      { status: 500 }
    )
  }
}