import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test accounts (required for testing)
  const johnPassword = await bcrypt.hash('johndoe123', 12)
  
  const testCandidate = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: johnPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      phone: '+40712345678',
      role: 'CANDIDATE',
      experienceLevel: 'INTERMEDIATE'
    }
  })

  // Create admin user
  const adminPassword = await bcrypt.hash('ancutadavid_1A', 12)

  await prisma.user.upsert({
    where: { email: 'ionutbaltag3@gmail.com' },
    update: {},
    create: {
      email: 'ionutbaltag3@gmail.com',
      password: adminPassword,
      firstName: 'Ionut',
      lastName: 'Baltag',
      name: 'Ionut Baltag',
      phone: '+40786538708',
      role: 'ADMIN',
      experienceLevel: 'EXPERT'
    }
  })

  console.log('✅ Admin account created!')
  console.log('👤 Admin: ionutbaltag3@gmail.com / ancutadavid_1A')

  // Additional users for testing
  const agencyOwnerPassword = await bcrypt.hash('admin123', 12)

  const agencyOwner = await prisma.user.upsert({
    where: { email: 'agency@example.com' },
    update: {},
    create: {
      email: 'agency@example.com',
      password: agencyOwnerPassword,
      firstName: 'Maria',
      lastName: 'Popescu',
      name: 'Maria Popescu',
      phone: '+40723456789',
      role: 'AGENCY_OWNER',
      experienceLevel: 'EXPERT'
    }
  })

  console.log('✅ Agency Owner: agency@example.com / admin123')

  // Create AI configuration for embeddings
  await prisma.aIConfig.upsert({
    where: { 
      provider_modelName: {
        provider: "openrouter",
        modelName: "google/gemma-3n-e4b-it"
      }
    },
    update: {},
    create: {
      provider: "openrouter",
      modelName: "google/gemma-3n-e4b-it",
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      isActive: true
    }
  })

  // Create AI configuration for chat and AI services
  await prisma.aIConfig.upsert({
    where: { 
      provider_modelName: {
        provider: "openrouter",
        modelName: "google/gemini-2.5-flash-lite"
      }
    },
    update: {
      baseURL: "https://openrouter.ai/api/v1",
      isActive: true,
    },
    create: {
      provider: "openrouter",
      modelName: "google/gemini-2.5-flash-lite",
      apiKey: process.env.OPENROUTER_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      isActive: true
    }
  })

  console.log('✅ AI Configuration created: OpenRouter with Google Gemma-3n-e4b-it for embeddings')
  console.log('✅ AI Configuration created: OpenRouter with Google Gemini-2.5-flash-lite for chat/services')
  console.log('🌱 Seed completed successfully!')
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
