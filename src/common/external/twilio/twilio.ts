import { post } from '../axios';
import { URLSearchParams } from 'url';
import { Logger } from '@nestjs/common';

export class Twilio {
  private readonly logger = new Logger(Twilio.name);
  private baseUrl = 'https://verify.twilio.com/v2/Services/';
  private readonly AccountSid: string;
  private readonly AuthToken: string;
  private readonly headers: { 'content-type': string };
  private readonly ServiceId: string;

  constructor() {
    this.AccountSid = <string>process.env.TWILIO_ACCOUNT_SID;
    this.AuthToken = <string>process.env.TWILIO_AUTH_TOKEN;
    this.ServiceId = <string>process.env.TWILIO_SERVICE_SID;
    this.headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };
  }

  async sendPhoneVerificationCode(phone: string) {
    const url = `${this.baseUrl}${this.ServiceId}/Verifications`;
    const response = await post(
      url,
      new URLSearchParams({ To: phone, Channel: 'sms' }),
      {
        headers: this.headers,
        auth: { username: this.AccountSid, password: this.AuthToken },
      },
    );
    this.logger.log(response);
    return response;
  }

  async verifyPhoneVerification(phone: string, code: string) {
    const url = `${this.baseUrl}${this.ServiceId}/VerificationCheck`;
    const response = await post(
      url,
      new URLSearchParams({ To: phone, Code: code }),
      {
        headers: this.headers,
        auth: { username: this.AccountSid, password: this.AuthToken },
      },
    );
    this.logger.log(response);
    return response;
  }
}
