import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = new Hono()

const createDocumentSchema = z.object({
  title: z.string(),
  fileUrl: z.string(),
  type: z.string()
})

// Upload document
router.post('/', async (c) => {
  try {
    const user = c.get('jwtPayload')
    const body = await c.req.json()
    const data = createDocumentSchema.parse(body)

    const document = await prisma.document.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    return c.json(document)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user's documents
router.get('/', async (c) => {
  const user = c.get('jwtPayload')
  const documents = await prisma.document.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json(documents)
})

// Get student documents (for teachers)
router.get('/students', async (c) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const className = c.req.query('class')
  const documents = await prisma.document.findMany({
    where: {
      user: {
        role: 'STUDENT',
        ...(className ? { class: className } : {})
      }
    },
    include: {
      user: {
        select: {
          name: true,
          nis: true,
          class: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json(documents)
})

export { router as documentRouter }
