// Run this to create a test AGENCY_OWNER account
// npx tsx test-agency-setup.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestAgencyOwner() {
  try {
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'agency@test.com' }
    }).catch(() => {}) // Ignore if not found

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 12)

    // Create test AGENCY_OWNER user
    await prisma.user.create({
      data: {
        email: 'agency@test.com',
        password: hashedPassword,
        name: 'Agency Owner',
        firstName: 'Agency',
        lastName: 'Owner',
        role: 'AGENCY_OWNER',
        experienceLevel: 'EXPERT'
      }
    })

    console.log('✅ Created test AGENCY_OWNER account:')
    console.log('Email: agency@test.com')
    console.log('Password: test123')
    console.log('')
    console.log('🔗 Agency Dashboard: http://localhost:3001/agency')
    console.log('')
    console.log('Features ready:')
    console.log('- Dashboard with real KPIs')
    console.log('- Client management')
    console.log('- Lead pipeline')
    console.log('- Placement tracking')
    console.log('- Commission calculations')

  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAgencyOwner()
