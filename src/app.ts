import { OpenAPIHono } from '@hono/zod-openapi'
import { route } from './api/confirmation-code/post/route'
import { serve } from '@hono/node-server'
import { handler } from './api/confirmation-code/post/handler'
import { swaggerUI } from '@hono/swagger-ui'

const app = new OpenAPIHono()

// routes
app.openapi(route, handler)

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Sample API',
  },
})

app.get('/swagger-ui', swaggerUI({ url: '/doc' }))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
