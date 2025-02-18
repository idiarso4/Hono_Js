import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = new Hono()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  nip: z.string()
})

const registerStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  nis: z.string(),
  class: z.string()
})

router.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return c.json({ error: 'Invalid password' }, 401)
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        nip: user.nip,
        nis: user.nis,
        class: user.class
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.post('/register/teacher', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name, nip } = registerTeacherSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'TEACHER',
        nip
      }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        nip: user.nip
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.post('/register/student', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name, nis, class: className } = registerStudentSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'STUDENT',
        nis,
        class: className
      }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        nis: user.nis,
        class: user.class
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { router as authRouter }
