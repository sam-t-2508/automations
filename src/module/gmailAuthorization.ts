import { promises as fs } from 'fs';
import * as path from 'path';
import * as process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { UserRefreshClient } from 'google-auth-library';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export const authorize = async (): Promise<UserRefreshClient> => {
  try {
    const savedClient = await loadSavedCredentialsIfExist();
    if (savedClient) {
      return savedClient;
    }

    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

    const refreshToken = client.credentials.refresh_token;

    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    return await createCredentials(refreshToken);
  } catch (error) {
    console.log(error)
    throw new Error('Failed to authorize')
  }
}

const loadSavedCredentialsIfExist = async (): Promise<UserRefreshClient | null> => {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    const client = google.auth.fromJSON(credentials);

    if (!(client instanceof UserRefreshClient)) {
      throw new Error('Invalid client type')
    }

    return client;
  } catch (err) {
    return null;
  }
}

const createCredentials = async (refreshToken: string): Promise<UserRefreshClient> => {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: refreshToken,
    });
    await fs.writeFile(TOKEN_PATH, payload)

    // FIXME: 2回認証挟むのきもい
    const client = google.auth.fromJSON(JSON.parse(payload))
    if (!(client instanceof UserRefreshClient)) {
      throw new Error('Invalid client type')
    }

    return client
  } catch (err) {
    throw err
  }
}