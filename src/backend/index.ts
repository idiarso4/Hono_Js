import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { PrismaClient } from '@prisma/client'
import { authRouter } from './routes/auth'
import { attendanceRouter } from './routes/attendance'
import { userRouter } from './routes/user'
import { leaveRouter } from './routes/leave'
import { documentRouter } from './routes/document'

const app = new Hono()
const prisma = new PrismaClient()

// Middleware
app.use('/*', cors())
app.use('/api/*', async (c, next) => {
  // Skip auth for login and register
  if (c.req.path.includes('/auth')) {
    return next()
  }
  return jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key'
  })(c, next)
})

// Routes
app.route('/api/auth', authRouter)
app.route('/api/attendance', attendanceRouter)
app.route('/api/users', userRouter)
app.route('/api/leaves', leaveRouter)
app.route('/api/documents', documentRouter)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
