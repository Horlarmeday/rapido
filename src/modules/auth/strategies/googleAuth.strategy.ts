import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuth {
  private client: OAuth2Client;
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async validate(token) {
    this.client.setCredentials({ access_token: token });
    const userinfo = await this.client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });
    const { email, family_name, given_name, picture } =
      userinfo.data as TokenPayload;
    return {
      email: <string>email,
      first_name: <string>given_name,
      last_name: <string>family_name,
      profile_photo: picture,
    };
  }
}
