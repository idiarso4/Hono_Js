import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import { jwt } from 'hono/jwt'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = new Hono()

const createAttendanceSchema = z.object({
  locationId: z.string(),
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
  method: z.enum(['FACE', 'QR_CODE', 'PHOTO', 'MANUAL']),
  photo: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  subject: z.string().optional()
})

// Get today's attendance for a user
router.get('/today', async (c) => {
  const user = c.get('jwtPayload')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const attendances = await prisma.attendance.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      location: true
    }
  })

  return c.json(attendances)
})

// Create new attendance
router.post('/', async (c) => {
  try {
    const user = c.get('jwtPayload')
    const body = await c.req.json()
    const data = createAttendanceSchema.parse(body)

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: data.locationId }
    })

    if (!location) {
      return c.json({ error: 'Location not found' }, 404)
    }

    // If location is locked, verify coordinates are within radius
    if (location.isLocked && data.latitude && data.longitude) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        data.latitude,
        data.longitude
      )

      if (distance > location.radius) {
        return c.json({ error: 'You are too far from the attendance location' }, 400)
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        ...data,
        userId: user.id,
        status: user.role === 'TEACHER' ? 'APPROVED' : 'PENDING'
      },
      include: {
        location: true
      }
    })

    return c.json(attendance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get attendance history with pagination
router.get('/history', async (c) => {
  const user = c.get('jwtPayload')
  const page = Number(c.req.query('page')) || 1
  const limit = Number(c.req.query('limit')) || 10
  const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined
  const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined

  const where = {
    userId: user.id,
    ...(startDate && endDate
      ? {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      : {})
  }

  const [attendances, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        location: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.attendance.count({ where })
  ])

  return c.json({
    data: attendances,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// For teachers: Get student attendances
router.get('/students', async (c) => {
  const user = c.get('jwtPayload')
  
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const className = c.req.query('class')
  const date = c.req.query('date') ? new Date(c.req.query('date')) : new Date()
  
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const attendances = await prisma.attendance.findMany({
    where: {
      user: {
        role: 'STUDENT',
        ...(className ? { class: className } : {})
      },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nis: true,
          class: true
        }
      },
      location: true
    }
  })

  return c.json(attendances)
})

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export { router as attendanceRouter }
