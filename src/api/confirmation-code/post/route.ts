import { createRoute } from '@hono/zod-openapi'
import { RequestSchema, ResponseSchema } from './schema'

const description = `
Gmail APIを使用してApple Id登録の過程で送られてくるメールアドレス認証コードを取得します  
受信までにラグが発生する可能性を加味して、取得失敗時には、数秒時間をあけて再度リクエストしてみることを推奨します  

※ 注意  
- 初回リクエスト時に認証が必要です  
- 認証は特定のGmailアドレスのみ可能です  
- これは、Google Cloudの制約です（というか、全てのGmailアドレスに対応しようとするとGoogleの審査を通す必要があって大変です）  
- Rate limitに注意してください。審査通した正式版を利用してないので、より厳しい制限がかかっている可能性があります
`

export const route: ReturnType<typeof createRoute> = createRoute({
  method: 'post',
  path: '/confirmation-code',
  summary: 'Appleからのメールアドレス認証コードを取得します',
  description,
  request: {
    body: {
      content: {
        'application/json': {
          schema: RequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema,
        },
      },
      description: 'Retrieve the user',
    },
    401: {
      description: 'Unauthorized',
    },
    404: {
      description: 'Not Found',
    },
    500: {
      description: 'Internal Server Error',
    },
  },
})
