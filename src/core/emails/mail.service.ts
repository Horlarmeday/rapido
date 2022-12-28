import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  sendMail(receiver, subject, emailBody) {
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
