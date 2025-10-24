import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash the admin password
  const adminPassword = await argon2.hash('admin123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibe.com' },
    update: {},
    create: {
      email: 'admin@vibe.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  console.log('Admin user created:', admin.email)
  console.log('Password: admin123')

  // Create a sample DJ user
  const djPassword = await argon2.hash('dj123', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  const dj = await prisma.user.upsert({
    where: { email: 'dj@vibe.com' },
    update: {},
    create: {
      email: 'dj@vibe.com',
      password: djPassword,
      name: 'DJ Mike',
      role: 'dj',
      djProfile: {
        create: {
          stageName: 'DJ Mike V',
          bio: 'Professional DJ with 10+ years of experience',
          phone: '555-1234',
          genres: ['House', 'Hip Hop', 'Top 40'],
          equipment: ['Pioneer DDJ-1000', 'JBL EON615', 'Shure SM58'],
          hourlyRate: 150.00,
          isActive: true,
        },
      },
    },
  })

  console.log('DJ user created:', dj.email)
  console.log('Password: dj123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
