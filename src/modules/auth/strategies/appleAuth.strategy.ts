import {
  getClientSecret,
  getAuthorizationToken,
  verifyIdToken,
} from 'apple-signin-auth';
import { ForbiddenException, Injectable } from '@nestjs/common';

export type AppleResponseType = {
  authorization: {
    state: boolean;
    code: string;
    id_token: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
};

@Injectable()
export class AppleAuth {
  private readonly clientSecret: string;
  constructor() {
    this.clientSecret = getClientSecret({
      clientID: <string>process.env.APPLE_CLIENT_ID,
      keyIdentifier: <string>process.env.APPLE_KEY_ID,
      privateKeyPath: <string>process.env.APPLE_KEYFILE_PATH,
      teamID: <string>process.env.APPLE_TEAM_ID,
    });
  }

  async validate(payload: AppleResponseType) {
    const { authorization } = payload;
    const tokens = await getAuthorizationToken(authorization.code, {
      clientID: <string>process.env.APPLE_CLIENT_ID,
      clientSecret: this.clientSecret,
      redirectUri: <string>process.env.APPLE_CALLBACK,
    });

    try {
      const data = await verifyIdToken(tokens.id_token);
      return { data, user: payload?.user || null };
    } catch (e) {
      throw new ForbiddenException();
    }
  }
}
