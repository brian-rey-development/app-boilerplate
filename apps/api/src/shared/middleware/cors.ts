import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: process.env.WEB_URL ?? 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Authorization', 'Content-Type', 'x-organization-id'],
  credentials: true,
})
