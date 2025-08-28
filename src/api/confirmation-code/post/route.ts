import { createRoute } from '@hono/zod-openapi'
import { RequestSchema, ResponseSchema } from './schema'

const description = `
Gmail APIを使用してApple Id登録の過程で送られてくるメールアドレス認証コードを取得します  
受信までにラグが発生する可能性を加味して、取得失敗時には、数秒時間をあけて再度リクエストしてみることを推奨します  

※ 注意  
- 初回リクエスト時に認証が必要です  
- 認証は特定のGmailアドレスのみ可能としています  
- これは、Google Cloudの制約です（全てのGmailアドレスに対応しようとするとGoogleの審査を通す必要があります。数万円の費用と数週間の審査が必要。）  
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
