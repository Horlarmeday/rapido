import { OAuth2Client } from 'google-auth-library';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuth {
  private client;
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async validate(token) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, family_name, given_name, picture } = ticket.getPayload();
    return {
      email,
      first_name: given_name,
      last_name: family_name,
      photo: picture,
    };
  }
}
