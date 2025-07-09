import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
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
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Check if account is active
        if (!user.isActive) {
          return null
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role as UserRole,
          subscriptionTier: user.subscriptionTier as SubscriptionTier,
          subscriptionExpiresAt: user.subscriptionExpiresAt || undefined,
          emailVerified: user.emailVerified,
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
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            role: true,
            subscriptionTier: true,
            subscriptionExpiresAt: true,
            emailVerified: true,
            isActive: true,
          }
        })
        
        if (dbUser && dbUser.isActive) {
          token.role = dbUser.role
          token.subscriptionTier = dbUser.subscriptionTier
          token.subscriptionExpiresAt = dbUser.subscriptionExpiresAt
          token.emailVerified = dbUser.emailVerified
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
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user for Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                role: "USER" as UserRole,
                subscriptionTier: "free" as SubscriptionTier,
                emailSubscribed: true,
              }
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