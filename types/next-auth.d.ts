
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    phone: string
    role: string
    experienceLevel: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      phone: string
      role: string
      experienceLevel: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    firstName: string
    lastName: string
    phone: string
    experienceLevel: string
  }
}
