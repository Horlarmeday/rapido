import {
  getClientSecret,
  getAuthorizationToken,
  verifyIdToken,
} from 'apple-signin-auth';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { FileUploadHelper } from '../../../common/helpers/file-upload.helpers';

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
  private fileHelper: FileUploadHelper = new FileUploadHelper();
  private secretKey;
  constructor() {
    this.init().then((res) => (this.secretKey = res));
  }

  async init() {
    return await this.fileHelper.readAndDownloadFile();
  }

  async validate(payload: AppleResponseType) {
    const { authorization } = payload;

    const clientSecret = getClientSecret({
      clientID: <string>process.env.APPLE_CLIENT_ID,
      keyIdentifier: <string>process.env.APPLE_KEY_ID,
      privateKeyPath: this.secretKey,
      teamID: <string>process.env.APPLE_TEAM_ID,
    });

    const tokens = await getAuthorizationToken(authorization.code, {
      clientID: <string>process.env.APPLE_CLIENT_ID,
      clientSecret: clientSecret,
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
