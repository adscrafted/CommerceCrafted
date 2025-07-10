import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { UserRole, SubscriptionTier } from "@/types/auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      subscriptionTier: SubscriptionTier
      subscriptionExpiresAt?: Date
      emailVerified?: Date
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    subscriptionTier: SubscriptionTier
    subscriptionExpiresAt?: Date
    emailVerified?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    subscriptionTier: SubscriptionTier
    subscriptionExpiresAt?: Date
    emailVerified?: Date
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user || !user.password_hash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isPasswordValid) {
          return null
        }

        // Check if account is active
        if (!user.is_active) {
          return null
        }

        // Update last login time
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id)

        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role as UserRole,
          subscriptionTier: user.subscription_tier as SubscriptionTier,
          subscriptionExpiresAt: user.subscription_expires_at ? new Date(user.subscription_expires_at) : undefined,
          emailVerified: user.email_verified ? new Date(user.email_verified) : undefined,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.subscriptionTier = user.subscriptionTier
        token.subscriptionExpiresAt = user.subscriptionExpiresAt
        token.emailVerified = user.emailVerified
      }
      
      // Refresh user data on each request to check for updates
      if (token.id) {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, role, subscription_tier, subscription_expires_at, email_verified, is_active')
          .eq('id', token.id)
          .single()
        
        if (!error && dbUser && dbUser.is_active) {
          token.role = dbUser.role
          token.subscriptionTier = dbUser.subscription_tier
          token.subscriptionExpiresAt = dbUser.subscription_expires_at ? new Date(dbUser.subscription_expires_at) : undefined
          token.emailVerified = dbUser.email_verified ? new Date(dbUser.email_verified) : undefined
        } else {
          // User is no longer active, invalidate token
          return null
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.subscriptionTier = token.subscriptionTier
        session.user.subscriptionExpiresAt = token.subscriptionExpiresAt
        session.user.emailVerified = token.emailVerified
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email!)
            .single()

          if (!existingUser) {
            // Create new user for Google OAuth
            await supabase
              .from('users')
              .insert({
                email: user.email!,
                name: user.name || "",
                role: "USER" as UserRole,
                subscription_tier: "free" as SubscriptionTier,
                email_subscribed: true,
              })
          }
          return true
        } catch (error) {
          console.error("Error creating user:", error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}