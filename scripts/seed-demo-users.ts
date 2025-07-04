import { seedUsers } from '../src/lib/seed-users'

async function main() {
  console.log('Seeding demo users...')
  await seedUsers()
  console.log('Demo users seeded successfully')
  process.exit(0)
}

main().catch((error) => {
  console.error('Error seeding demo users:', error)
  process.exit(1)
})