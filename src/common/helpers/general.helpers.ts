import { v4 as uuidv4 } from 'uuid';
import { Messages } from '../../core/messages/messages';
import { BadGatewayException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { chain } from 'lodash';
import * as Banks from '../../modules/banks/json/banks.json';
import * as moment from 'moment';
import { CardDetailsType } from '../external/payment/providers/paystack';
import { PaymentProvider } from '../../modules/admin-settings/types/admin-settings.types';

type GenerateEmailAndSendType = {
  email: string;
  subject: Messages | string;
  emailBody: any;
  attachments?: any[];
};

const logger = new Logger();

export class GeneralHelpers {
  generateRandomNumbers(length: number) {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    );
  }

  generateRandomCharacters(length: number) {
    const uniq = uuidv4();
    return uniq
      .split('-')
      .join('')
      .substring(uniq.length - length - 4)
      .toUpperCase();
  }

  paginate(data: any, page: number | undefined, limit: number, total: number) {
    const currentPage = page || 1;
    const pages = Math.ceil(total / limit);
    const perPage = limit;

    return { total, docs: data, pages, perPage, currentPage };
  }

  calcLimitAndOffset(page: number, size: number | undefined) {
    const limit = size || 10;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
  }

  genTxReference() {
    const currentDate = new Date().toISOString().slice(0, 11);
    return `${currentDate}-${this.generateRandomCharacters(10)}`;
  }

  groupBy(data: any, fieldToGroupBy: string) {
    return chain(data)
      .groupBy((x) => x?.[fieldToGroupBy])
      .map((value, key) => ({
        date: key,
        data: value,
      }))
      .value();
  }

  groupByDate(data: any, fieldToGroupBy: string) {
    return chain(data)
      .groupBy((x) => this.withoutTime(x?.[fieldToGroupBy]))
      .map((value, key) => ({
        date: moment(key).format('YYYY-MM-DD'),
        data: value,
      }))
      .value();
  }

  withoutTime(dateTime) {
    const date = new Date(dateTime.getTime());
    date.setHours(0, 0, 0, 0);
    return date;
  }

  generateEmailAndSend({
    email,
    subject,
    emailBody,
    attachments,
  }: GenerateEmailAndSendType) {
    // Send email
    this.sendEmail(email, subject, emailBody, attachments).then((r) =>
      logger.log('Email sent!', r),
    );
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

  async sendEmail(
    email: string,
    subject: Messages | string,
    emailBody: any,
    attachments: any[] = [],
  ) {
    const message = {
      from: `'Rapid Capsules' <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject,
      html: emailBody,
      attachments,
    };
    const transport = this.nodeMailerTransport();
    try {
      await new Promise((resolve, reject) => {
        transport
          .sendMail(message)
          .then((info) => {
            logger.log(`Email sent to ${email}`);
            resolve(info);
          })
          .catch((error) => {
            logger.error('An error occurred sending email', error);
            reject(error);
          });
      });
      // transport.verify(function (error, success) {
      //   console.log('Success verification', success);
      //   if (error) {
      //     console.log(error);
      //     logger.error(`Error: ${error}`);
      //   } else {
      //     transport.sendMail(message, (error, info) => {
      //       console.log('Success send mail', info);
      //       if (error) {
      //         console.log(error);
      //         logger.error(`Error: ${error}`);
      //       }
      //       console.log('It went thru', info);
      //       logger.log(`Email sent to ${email}!`);
      //     });
      //   }
      // });
    } catch (e) {
      throw new BadGatewayException(e);
    }
  }

  static findBankCode(bank_name: string) {
    return Banks.find(({ name }) => name === bank_name)?.code;
  }

  formatCardDetails(cardDetails: CardDetailsType, agent: PaymentProvider) {
    return {
      currency: 'NGN',
      auth_code: cardDetails?.authorization_code,
      card_type: cardDetails?.card_type,
      last4Digit: cardDetails?.last4,
      expiry: moment(
        `${cardDetails?.exp_year}-${cardDetails?.exp_month}-01`,
      ).toDate(),
      issuer: cardDetails?.bank,
      agent,
    };
  }

  daysOfTheWeek() {
    return {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday',
    };
  }
}
