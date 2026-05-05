import { Hono } from 'hono'
import { authMiddleware } from '../../shared/middleware/auth'
import { registerHandler } from './handlers/register/handler'
import { loginHandler } from './handlers/login/handler'

export const authRoutes = new Hono()
  .post('/register', authMiddleware, registerHandler)
  .post('/login', loginHandler)
