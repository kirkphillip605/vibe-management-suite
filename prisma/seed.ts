import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vibe.com' },
    update: {},
    create: {
      email: 'admin@vibe.com',
      password: adminPassword,
      name: 'Admin User',
      user_role: UserRole.admin,
    },
  })

  console.log('Created admin user:', admin)

  // Create DJ user
  const djPassword = await bcrypt.hash('dj123', SALT_ROUNDS)
  
  const dj = await prisma.user.upsert({
    where: { email: 'dj@vibe.com' },
    update: {},
    create: {
      email: 'dj@vibe.com',
      password: djPassword,
      name: 'DJ User',
      user_role: UserRole.dj,
    },
  })

  console.log('Created DJ user:', dj)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })