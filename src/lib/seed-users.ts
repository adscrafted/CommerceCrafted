import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function seedUsers() {
  try {
    // Check if users already exist
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@commercecrafted.com' }
    })

    if (existingAdmin) {
      console.log('Demo users already exist')
      return
    }

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('password', 12)
    await prisma.user.create({
      data: {
        email: 'admin@commercecrafted.com',
        passwordHash: adminPasswordHash,
        name: 'Admin User',
        role: 'ADMIN',
        subscriptionTier: 'enterprise',
        emailSubscribed: true,
      }
    })

    // Create regular user
    const userPasswordHash = await bcrypt.hash('password', 12)
    await prisma.user.create({
      data: {
        email: 'user@commercecrafted.com',
        passwordHash: userPasswordHash,
        name: 'Demo User',
        role: 'USER',
        subscriptionTier: 'free',
        emailSubscribed: true,
      }
    })

    // Create pro user
    const proUserPasswordHash = await bcrypt.hash('password', 12)
    await prisma.user.create({
      data: {
        email: 'pro@commercecrafted.com',
        passwordHash: proUserPasswordHash,
        name: 'Pro User',
        role: 'USER',
        subscriptionTier: 'pro',
        emailSubscribed: true,
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    console.log('Demo users created successfully')
  } catch (error) {
    console.error('Error seeding users:', error)
  }
}