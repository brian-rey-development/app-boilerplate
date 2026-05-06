export function createOpenApiSpec() {
  const apiUrl = process.env.API_URL ?? 'http://localhost:3001'

  return {
    openapi: '3.1.0',
    info: {
      title: 'SaaS Boilerplate API',
      version: '0.0.1',
      description:
        'Production-ready multi-tenant SaaS API with organization management, authentication, and AI infrastructure.',
    },
    servers: [{ url: apiUrl }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['Health'],
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: { status: { type: 'string', example: 'healthy' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          description: 'Complete user registration by creating a profile. Requires a valid Supabase JWT (obtained client-side via supabase.auth). Call this after the user first signs in.',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    fullName: { type: 'string' },
                  },
                  required: ['email'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login instructions',
          description: 'Authentication is handled client-side via Supabase Auth. Obtain a session by calling supabase.auth.signInWithPassword() or supabase.auth.signInWithOAuth() in your client, then pass the resulting JWT as a Bearer token to all other endpoints.',
          tags: ['Auth'],
          responses: {
            '200': { description: 'Login handled by Supabase client' },
          },
        },
      },
      '/organization': {
        post: {
          summary: 'Create an organization',
          tags: ['Organization'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    slug: { type: 'string', minLength: 3, maxLength: 50, pattern: '^[a-z0-9-]+$' },
                  },
                  required: ['name', 'slug'],
                },
              },
            },
          },
          responses: {
            '201': { description: 'Organization created' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '409': { description: 'Slug already taken', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/organization/{slug}': {
        get: {
          summary: 'Get organization by slug',
          tags: ['Organization'],
          parameters: [
            { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Organization data' },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/organization/{slug}/members': {
        get: {
          summary: 'List organization members',
          tags: ['Organization'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Member list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Member' },
                  },
                  example: [
                    { organizationId: 'org-uuid-1', userId: 'user-uuid-1', role: 'owner', joinedAt: '2026-01-15T10:00:00Z' },
                    { organizationId: 'org-uuid-1', userId: 'user-uuid-2', role: 'member', joinedAt: '2026-02-20T14:30:00Z' },
                  ],
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Not a member of this organization', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        Member: {
          type: 'object',
          properties: {
            organizationId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['owner', 'admin', 'member'] },
            joinedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase JWT token',
        },
      },
    },
  }
}
