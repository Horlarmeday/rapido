import { uuid } from 'uuidv4';
import { Messages } from '../../core/messages/messages';
import { MailService } from '../../core/emails/mail.service';
import { Injectable } from '@nestjs/common';

type GenerateEmailAndSendType = {
  email: string;
  subject: Messages;
  emailBody: any;
};
@Injectable()
export class GeneralHelpers {
  constructor(private mailService: MailService) {}
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
    this.mailService.sendMail(email, subject, emailBody);
  }
}
