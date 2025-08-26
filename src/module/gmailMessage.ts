import { google } from 'googleapis';
import { UserRefreshClient } from 'google-auth-library';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail/v1';

export class GmailMessage {
  private auth: UserRefreshClient

  constructor(auth: UserRefreshClient) {
    this.auth = auth
  }

  getMessagesFromApple = async (email: string): Promise<gmail_v1.Schema$Message[]> => {
    const gmail = google.gmail({version: 'v1', auth: this.auth})

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${email},from:appleid@id.apple.com`
    });

    return res.data.messages ?? []
  }

  getMessage = async (messageId: string): Promise<gmail_v1.Schema$Message> => {
    const gmail = google.gmail({version: 'v1', auth: this.auth})

    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    return res.data
  }
}