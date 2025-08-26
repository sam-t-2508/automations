import { Context } from 'hono'
import { RequestSchema, ResponseSchema } from './schema'
import { z } from 'zod'
import { authorize } from '../../../module/gmailAuthorization'
import { GmailMessage } from '../../../module/gmailMessage'

export const handler = async (c: Context) => {
  try {
    const body = await c.req.json();

    const parsed = RequestSchema.parse(body)

    const result = await logic(parsed)

    return c.json(ResponseSchema.parse(result))
  } catch (error) {
    if (!(error instanceof Error)) {
      return c.json({ error: 'Internal server error' }, 500)
    }

    if (error.message.includes('No message')) {
      return c.json({ error: error.message }, 404)
    }

    if (error.message.includes('Failed to authorize')) {
      return c.json({ error: error.message }, 401)
    }

    return c.json({ error: error.message }, 500)
  }
}

const logic = async (request: z.infer<typeof RequestSchema>) => {
  const { email } = request

  const auth = await authorize()
  const gmailMessage = new GmailMessage(auth)

  const messages = await gmailMessage.getMessagesFromApple(email)

  const message = messages[0]
  if (!message || !message.id) {
    throw new Error('No message')
  }

  const snippet = (await gmailMessage.getMessage(message.id)).snippet ?? ''
  const regex = /[0-9]{6}/g;
  const match = snippet.match(regex);
  const confirmationCode = match?.[0] ?? ''

  if (!confirmationCode) {
    throw new Error('No message')
  }

  return {
    code: confirmationCode,
  }
}