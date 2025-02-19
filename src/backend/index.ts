import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { serveStatic } from '@hono/node-server/serve-static'
import { PrismaClient } from '@prisma/client'
import { authRouter } from './routes/auth'
import { attendanceRouter } from './routes/attendance'
import { userRouter } from './routes/user'
import { leaveRouter } from './routes/leave'
import { documentRouter } from './routes/document'
import { homeVisitRouter } from './routes/homeVisit'
import { compare, hash } from 'bcrypt'

const app = new Hono()
const prisma = new PrismaClient()

// Middleware
app.use('/*', cors())

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

app.use('/api/protected/*', async (c, next) => {
  const auth = await jwt({
    secret: JWT_SECRET,
  })(c, next)
  return auth
})

app.use('/api/*', async (c, next) => {
  // Skip auth for login and register
  if (c.req.path.includes('/auth')) {
    return next()
  }
  return jwt({
    secret: JWT_SECRET
  })(c, next)
})

// Auth routes
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return c.json({ error: 'Invalid password' }, 401)
    }

    const token = await jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET)

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/auth/register', async (c) => {
  const { email, password, name, role } = await c.req.json()

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400)
    }

    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    })

    const token = await jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET)

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/api/auth/me', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1]
    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }

    const decoded = await jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// Protected routes example
app.get('/api/protected/profile', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  if (!token) {
    return c.json({ error: 'No token provided' }, 401)
  }

  try {
    const decoded = await jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    return c.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// Admin routes
app.get('/api/admin/dashboard/stats', async (c) => {
  try {
    // Get total counts
    const [
      totalStudents,
      totalTeachers,
      totalCounselors,
      attendanceToday,
      pendingLeaves,
      pendingHomeVisits
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'COUNSELOR' } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          status: 'PRESENT'
        }
      }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      prisma.homeVisit.count({ where: { status: 'PENDING' } })
    ])

    // Get total students for calculating absent count
    const totalStudentsForAttendance = await prisma.user.count({
      where: { role: 'STUDENT', active: true }
    })

    return c.json({
      totalStudents,
      totalTeachers,
      totalCounselors,
      attendanceToday,
      absentToday: totalStudentsForAttendance - attendanceToday,
      pendingLeaves,
      pendingHomeVisits
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard statistics' }, 500)
  }
})

// Teacher routes
app.get('/api/teacher/dashboard/stats', async (c) => {
  try {
    const teacherId = c.get('jwtPayload').id

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    // Get all classes taught by this teacher
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId },
      include: {
        students: true
      }
    })

    // Get class IDs
    const classIds = teacherClasses.map(c => c.id)

    // Get total students across all classes
    const totalStudents = teacherClasses.reduce((acc, curr) => acc + curr.students.length, 0)

    // Get today's attendance for teacher's classes
    const attendanceToday = await prisma.attendance.count({
      where: {
        classId: { in: classIds },
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: 'PRESENT'
      }
    })

    // Get pending leaves for teacher's classes
    const pendingLeaves = await prisma.leave.count({
      where: {
        student: {
          classId: { in: classIds }
        },
        status: 'PENDING'
      }
    })

    // Get upcoming tests/assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        dueDate: {
          gt: new Date()
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 5
    })

    // Get class performance
    const classPerformance = await Promise.all(
      teacherClasses.map(async (cls) => {
        const averageScore = await prisma.assignment.aggregate({
          where: {
            classId: cls.id,
            submissions: {
              some: {}
            }
          },
          _avg: {
            averageScore: true
          }
        })

        return {
          className: cls.name,
          averageScore: averageScore._avg.averageScore || 0
        }
      })
    )

    return c.json({
      totalClasses: teacherClasses.length,
      totalStudents,
      attendanceToday,
      absentToday: totalStudents - attendanceToday,
      pendingLeaves,
      upcomingAssignments,
      classPerformance
    })
  } catch (error) {
    console.error('Teacher dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch teacher dashboard statistics' }, 500)
  }
})

// Student routes
app.get('/api/student/dashboard/stats', async (c) => {
  try {
    const studentId = c.get('jwtPayload').id

    // Get student data with class
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!student || !student.class) {
      return c.json({ error: 'Student or class not found' }, 404)
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    // Get student's attendance status for today
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Get attendance percentage for current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const monthAttendance = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalDays = await prisma.attendance.count({
      where: {
        classId: student.classId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      distinct: ['date']
    })

    const attendancePercentage = totalDays > 0 
      ? (monthAttendance.filter(a => a.status === 'PRESENT').length / totalDays) * 100 
      : 100

    // Get upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        classId: student.classId,
        dueDate: {
          gt: new Date()
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 5
    })

    // Get recent grades
    const recentGrades = await prisma.assignmentSubmission.findMany({
      where: {
        studentId
      },
      include: {
        assignment: true
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 5
    })

    // Get active leaves
    const activeLeaves = await prisma.leave.findMany({
      where: {
        studentId,
        endDate: {
          gte: new Date()
        }
      }
    })

    return c.json({
      student: {
        name: student.name,
        class: student.class.name,
        teacher: student.class.teacher.name
      },
      attendance: {
        today: todayAttendance?.status || 'NOT_MARKED',
        monthPercentage: attendancePercentage
      },
      upcomingAssignments,
      recentGrades,
      activeLeaves
    })
  } catch (error) {
    console.error('Student dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch student dashboard statistics' }, 500)
  }
})

// Counselor routes
app.get('/api/counselor/dashboard/stats', async (c) => {
  try {
    const counselorId = c.get('jwtPayload').id

    // Get counselor data
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId }
    })

    if (!counselor) {
      return c.json({ error: 'Counselor not found' }, 404)
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    // Get upcoming counseling sessions
    const upcomingSessions = await prisma.counselingSession.findMany({
      where: {
        counselorId,
        scheduledAt: {
          gt: new Date()
        },
        status: 'SCHEDULED'
      },
      include: {
        student: true
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      take: 5
    })

    // Get today's sessions
    const todaySessions = await prisma.counselingSession.findMany({
      where: {
        counselorId,
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        student: true
      }
    })

    // Get pending home visit requests
    const pendingHomeVisits = await prisma.homeVisit.findMany({
      where: {
        counselorId,
        status: 'PENDING'
      },
      include: {
        student: true
      }
    })

    // Get monthly statistics
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const monthlyStats = await prisma.counselingSession.groupBy({
      by: ['status'],
      where: {
        counselorId,
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _count: true
    })

    // Get students requiring attention (multiple absences or low grades)
    const studentsNeedingAttention = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        OR: [
          {
            attendances: {
              some: {
                status: 'ABSENT',
                date: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              }
            }
          },
          {
            assignmentSubmissions: {
              some: {
                score: {
                  lt: 60
                },
                submittedAt: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              }
            }
          }
        ]
      },
      include: {
        class: true,
        _count: {
          select: {
            attendances: true,
            assignmentSubmissions: true
          }
        }
      },
      take: 10
    })

    return c.json({
      counselor: {
        name: counselor.name
      },
      todayStats: {
        totalSessions: todaySessions.length,
        completedSessions: todaySessions.filter(s => s.status === 'COMPLETED').length,
        pendingSessions: todaySessions.filter(s => s.status === 'SCHEDULED').length
      },
      monthlyStats: {
        sessions: monthlyStats,
        totalHomeVisits: await prisma.homeVisit.count({
          where: {
            counselorId,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        })
      },
      upcomingSessions,
      pendingHomeVisits,
      studentsNeedingAttention
    })
  } catch (error) {
    console.error('Counselor dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch counselor dashboard statistics' }, 500)
  }
})

// Routes
app.route('/api/auth', authRouter)
app.route('/api/attendance', attendanceRouter)
app.route('/api/users', userRouter)
app.route('/api/leaves', leaveRouter)
app.route('/api/documents', documentRouter)
app.route('/api/home-visits', homeVisitRouter)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Serve static files from frontend dist
app.use('/*', serveStatic({ root: '../frontend/dist' }))

// Handle root route
app.get('/', (c) => c.redirect('/index.html'))

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
