import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Messages } from '../messages/messages';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  sendMail(receiver: string, subject: Messages, emailBody: any) {
    this.mailerService
      .sendMail({
        to: receiver, // list of receivers
        from: `'Rapid Capsule' <${process.env.EMAIL_SENDER}>`, // sender address
        subject, // Subject line
        html: emailBody, // HTML body content
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
