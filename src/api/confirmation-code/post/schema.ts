import { z } from '@hono/zod-openapi'

export const RequestSchema = z.object({
  email: z
    .email()
    .openapi({
      example: 'test@test.com',
    }),
})

export const ResponseSchema = z
  .object({
    code: z
      .string()
      .regex(/^\d{6}$/)
      .openapi({
        example: '123456',
      }),
  })
