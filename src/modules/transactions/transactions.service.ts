import { Injectable } from '@nestjs/common';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import { PaymentsService } from '../payments/payments.service';
import { Status } from '../payments/entities/payment.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly paymentHandler: PaymentHandler,
    private readonly paymentService: PaymentsService,
  ) {}
  async verifyTransaction(reference: string) {
    const response = await this.paymentHandler.verifyTransaction(reference);
    switch (response.data.data.status) {
      case SUCCESS:
        return await this.paymentService.updatePayment(reference, {
          status: Status.SUCCESS,
        });
      case FAILED:
        return await this.paymentService.updatePayment(reference, {
          status: Status.FAILED,
        });
      case PENDING:
        // do nothing
        return this.paymentService.findPaymentByReference(reference);
    }
    return true;
  }
}
