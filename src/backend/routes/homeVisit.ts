import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const homeVisitRouter = new Hono()
const prisma = new PrismaClient()

// Get all home visits
homeVisitRouter.get('/', async (c) => {
  try {
    const visits = await prisma.homeVisit.findMany({
      include: {
        student: true
      }
    })
    return c.json(visits)
  } catch (error) {
    return c.json({ error: 'Failed to fetch home visits' }, 500)
  }
})

// Get home visit statistics
homeVisitRouter.get('/statistics', async (c) => {
  try {
    const [total, completed, planned, thisMonth] = await Promise.all([
      prisma.homeVisit.count(),
      prisma.homeVisit.count({ where: { status: 'COMPLETED' } }),
      prisma.homeVisit.count({ where: { status: 'PLANNED' } }),
      prisma.homeVisit.count({
        where: {
          date: {
            gte: new Date(new Date().setDate(1)),
            lt: new Date(new Date().setMonth(new Date().getMonth() + 1))
          }
        }
      })
    ])

    return c.json({ total, completed, planned, thisMonth })
  } catch (error) {
    return c.json({ error: 'Failed to fetch statistics' }, 500)
  }
})

// Create home visit
const createVisitSchema = z.object({
  studentId: z.string(),
  date: z.string(),
  purpose: z.string(),
  parentName: z.string(),
  address: z.string(),
  findings: z.string(),
  recommendations: z.string().optional(),
  followUpActions: z.string().optional(),
  status: z.enum(['PLANNED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'])
})

homeVisitRouter.post('/', zValidator('json', createVisitSchema), async (c) => {
  try {
    const data = await c.req.json()
    const visit = await prisma.homeVisit.create({
      data: {
        ...data,
        counselorId: c.get('jwtPayload').sub
      },
      include: {
        student: true
      }
    })
    return c.json(visit, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create home visit' }, 500)
  }
})

// Update home visit
homeVisitRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    
    const visit = await prisma.homeVisit.update({
      where: { id },
      data,
      include: {
        student: true
      }
    })
    return c.json(visit)
  } catch (error) {
    return c.json({ error: 'Failed to update home visit' }, 500)
  }
})

// Delete home visit
homeVisitRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await prisma.homeVisit.delete({
      where: { id }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete home visit' }, 500)
  }
})

export { homeVisitRouter }
