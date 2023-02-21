import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './entities/payment.entity';
import { create, findOne, updateOne } from 'src/common/crud/crud';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}
  async create(
    userId: Types.ObjectId,
    reference: string,
    amount: number,
    payment_for: string,
  ) {
    await create(this.paymentModel, {
      userId,
      reference,
      amount,
      payment_for,
    });
  }

  async findPaymentByReference(reference: string) {
    return await findOne(this.paymentModel, { reference });
  }

  async updatePayment(reference: string, fieldsToUpdate) {
    const payment = await updateOne(
      this.paymentModel,
      { reference },
      { ...fieldsToUpdate },
    );
    this.logger.log(`Updated payment reference: ${reference} to successful`);
    return payment;
  }
}
