import { uuid } from 'uuidv4';
import { Messages } from '../../core/messages/messages';
import { BadGatewayException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type GenerateEmailAndSendType = {
  email: string;
  subject: Messages;
  emailBody: any;
};

const logger = new Logger();

export class GeneralHelpers {
  generateRandomNumbers(length: number) {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    );
  }

  generateRandomCharacters(length: number) {
    const uniq = uuid();
    return uniq
      .split('-')
      .join('')
      .substring(uniq.length - length - 4)
      .toUpperCase();
  }

  paginate(data: any, page: number, limit: number) {
    const { count: total, rows: docs } = data;
    const currentPage = page || 1;
    const pages = Math.ceil(total / limit);
    const perPage = limit;

    return { total, docs, pages, perPage, currentPage };
  }

  getPagination(page: number, size: number) {
    const limit = size || 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
  }

  genTxReference() {
    const currentDate = new Date().toISOString().slice(0, 11);
    return `${currentDate}-${this.generateRandomCharacters(17)}`;
  }

  generateEmailAndSend({
    email,
    subject,
    emailBody,
  }: GenerateEmailAndSendType) {
    // Send email
    this.sendMail(email, subject, emailBody);
  }

  nodeMailerTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  sendMail(email, subject, emailBody) {
    const message = {
      from: `'Rapid Capsules' <${process.env.EMAIL_SENDER}>`,
      to: `${email}`,
      subject,
      html: emailBody,
    };
    const transport = this.nodeMailerTransport();
    try {
      transport.verify(function (error, success) {
        if (error) {
          logger.error(`Error: ${error}`);
        } else {
          transport.sendMail(message, (error, info) => {
            if (error) {
              logger.error(`Error: ${error}`);
            }
            logger.log(`Email sent to ${email}!`);
          });
        }
      });
    } catch (e) {
      throw new BadGatewayException(e);
    }
  }
}
