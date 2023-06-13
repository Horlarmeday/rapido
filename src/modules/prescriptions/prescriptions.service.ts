import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Prescription,
  PrescriptionDocument,
} from './entities/prescription.entity';
import { Model, Types } from 'mongoose';
import {
  create,
  deleteOne,
  find,
  findOne,
  updateOneAndReturn,
} from '../../common/crud/crud';
import { UploadPrescriptionDto } from './dto/upload-prescription.dto';
import {
  PrescriptionFile,
  PrescriptionFileDocument,
} from './entities/prescription-file.entity';
import { TaskScheduler } from '../../core/worker/task.scheduler';
import { Messages } from '../../core/messages/messages';
import * as mime from 'mime-types';
import { Documents } from '../users/types/profile.types';
import { FileUploadHelper } from '../../common/helpers/file-upload.helpers';
import { UsersService } from '../users/users.service';
import { SendPharmacyPrescriptionDto } from './dto/send-pharmacy-prescription.dto';
import { SendPatientPrescriptionDto } from './dto/send-patient-prescription.dto';
import { Order, OrderDocument, PaymentStatus } from './entities/order.entity';
import { Drug, DrugDocument } from './entities/drug.entity';
import { FAILED, PENDING, SUCCESS } from '../../core/constants';
import { PaymentFor, Status } from '../payments/entities/payment.entity';
import { PaymentHandler } from '../../common/external/payment/payment.handler';
import { PaymentsService } from '../payments/payments.service';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { VerifyOrderPaymentDto } from './dto/verify-order-payment.dto';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);
  constructor(
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(PrescriptionFile.name)
    private prescriptionFileModel: Model<PrescriptionFileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Drug.name)
    private drugModel: Model<DrugDocument>,
    private taskCron: TaskScheduler,
    private readonly fileUpload: FileUploadHelper,
    private readonly usersService: UsersService,
    private readonly paymentHandler: PaymentHandler,
    private readonly paymentsService: PaymentsService,
    private readonly generalHelpers: GeneralHelpers,
  ) {}
  async createPrescription(
    userId: Types.ObjectId,
    createPrescriptionDto: CreatePrescriptionDto,
  ) {
    const { items, patient } = createPrescriptionDto;
    return await create(this.prescriptionModel, {
      items,
      patient,
      prescribed_by: userId,
    });
  }

  async getOnePrescription(
    prescriptionId: Types.ObjectId,
  ): Promise<PrescriptionDocument> {
    return await findOne(this.prescriptionModel, { _id: prescriptionId });
  }

  async getOnePrescriptionFile(prescriptionId: Types.ObjectId) {
    return await findOne(this.prescriptionFileModel, { _id: prescriptionId });
  }

  async getOneOrder(orderId: Types.ObjectId): Promise<OrderDocument> {
    return await findOne(this.orderModel, { _id: orderId });
  }

  async getOneDrug(drugId: Types.ObjectId): Promise<DrugDocument> {
    return await findOne(this.drugModel, { _id: drugId });
  }

  async getPrescriptionsByUser(userId: Types.ObjectId) {
    return await find(this.prescriptionModel, { patient: userId });
  }

  async getPatientOrders(userId: Types.ObjectId) {
    return await find(this.orderModel, { patient: userId });
  }

  async getPrescriptionFilesByUser(userId: Types.ObjectId) {
    return await find(this.prescriptionFileModel, { patient: userId });
  }

  async updateOrder(
    orderId: Types.ObjectId,
    fieldsToUpdate: object,
  ): Promise<OrderDocument> {
    return await updateOneAndReturn(
      this.orderModel,
      { _id: orderId },
      { ...fieldsToUpdate },
    );
  }

  async updatePrescription(
    prescriptionId: Types.ObjectId,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return await updateOneAndReturn(
      this.prescriptionModel,
      { _id: prescriptionId },
      { ...updatePrescriptionDto },
    );
  }

  async confirmOrder(orderId: Types.ObjectId) {
    return await updateOneAndReturn(
      this.orderModel,
      { _id: orderId },
      { is_order_confirmed: true },
    );
  }

  async sendPrescriptionToPatient(
    sendPatientPrescriptionDto: SendPatientPrescriptionDto,
  ) {
    return await updateOneAndReturn(
      this.prescriptionModel,
      { _id: sendPatientPrescriptionDto.prescriptionId },
      { is_sent_to_patient: true },
    );
  }

  async sendPrescriptionToPharmacy(
    sendPharmacyPrescriptionDto: SendPharmacyPrescriptionDto,
    userId: Types.ObjectId,
  ) {
    const { pharmacy, prescriptionId } = sendPharmacyPrescriptionDto;
    const prescription = await this.getOnePrescription(prescriptionId);
    const user = await this.usersService.findById(userId);
    const model = prescription
      ? this.prescriptionModel
      : this.prescriptionFileModel;

    const items = prescription.items.map(async ({ drug, dose }) => {
      const orderedDrug = await this.getOneDrug(drug);
      return {
        drug_name: orderedDrug?.name,
        unit_price: orderedDrug?.price,
        quantity: dose.quantity,
        total: dose.quantity * +orderedDrug.price,
      };
    });
    const delivery_fee = 950; //todo: change this later
    const total = this.reduce(items) + delivery_fee;
    const [sentPrescription, _] = await Promise.all([
      await updateOneAndReturn(
        model,
        { _id: prescriptionId },
        { is_sent_to_pharmacy: true, pharmacy },
      ),
      await create(this.orderModel, {
        patient: prescription.patient,
        prescription: prescription._id,
        items,
        sub_total: this.reduce(items),
        total_price: total,
        shipping_details: {
          address: user.profile.contact.address1,
          email: user.profile.contact.email,
          phone: `${user.profile.contact.phone.country_code}${user.profile.contact.phone.number}`,
        },
      }),
    ]);
    return sentPrescription;
  }

  async deletePrescription(prescriptionId: Types.ObjectId) {
    return await deleteOne(this.prescriptionModel, { _id: prescriptionId });
  }

  async uploadPrescription(
    userId: Types.ObjectId,
    uploadPrescriptionDto: UploadPrescriptionDto,
  ) {
    const { documents, specialist } = uploadPrescriptionDto;
    const user = await this.usersService.findById(userId);

    const prescription = await create(this.prescriptionFileModel, {
      title: `${user.full_name} Prescription`,
      description: 'Drugs prescription',
      specialist,
      patient: userId,
      documents:
        documents?.map(({ file_type, original_name, type_of_document }) => ({
          file_type,
          original_name,
          type_of_document,
          url: '',
        })) || [],
    });
    if (documents?.length) {
      await this.taskCron.addCron(
        this.uploadDocument(documents, prescription),
        `${Date.now()}-${userId}`,
      );
    }
    return prescription;
  }

  async getPrescriptions(userId: Types.ObjectId) {
    const [prescriptions, files] = await Promise.all([
      this.getPrescriptionsByUser(userId),
      this.getPrescriptionFilesByUser(userId),
    ]);
    return [...prescriptions, ...files];
  }

  async startOrderPayment(userId: Types.ObjectId, amount: number) {
    const reference = this.generalHelpers.genTxReference();
    return await this.paymentsService.create(
      userId,
      reference,
      amount,
      PaymentFor.PRESCRIPTION,
    );
  }

  async verifyOrderPayment(verifyOrderPaymentDto: VerifyOrderPaymentDto) {
    const { reference, orderId } = verifyOrderPaymentDto;
    const response = await this.paymentHandler.verifyTransaction(reference);
    try {
      switch (response?.data?.status) {
        case SUCCESS:
          await this.paymentsService.updatePayment(reference, {
            status: Status.SUCCESSFUL,
            metadata: {
              order_id: orderId,
            },
          });
          await this.updateOrder(orderId, {
            payment_status: PaymentStatus.PAID,
          });
          return await this.getOneOrder(orderId);
        case FAILED:
          await this.paymentsService.updatePayment(reference, {
            status: Status.FAILED,
            metadata: {
              order_id: orderId,
            },
          });
          await this.updateOrder(orderId, {
            payment_status: PaymentStatus.FAILED,
          });
          return await this.getOneOrder(orderId);
        case PENDING:
          return await this.getOneOrder(orderId);
        default:
          return await this.getOneOrder(orderId);
      }
    } catch (e) {
      this.logger.error('An error occurred verifying order payment', e);
      throw new InternalServerErrorException(e, 'An error occurred');
    }
  }

  private async uploadDocument(
    documents: Documents[],
    prescription: PrescriptionFileDocument,
  ) {
    try {
      const promises = await Promise.all(
        documents.map(({ url, original_name }) => {
          this.logger.log(`Uploading ${original_name} document`);
          const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches?.length !== 3)
            throw new BadRequestException(Messages.INVALID_BASE64);

          const buffer = Buffer.from(matches[2], 'base64');
          const extension = mime.extension(matches[1]);
          return this.fileUpload.uploadToS3(
            buffer,
            `${prescription._id}-document.${extension}`,
          );
        }),
      );
      prescription.documents.map((doc, index) => {
        doc.url = promises[index];
      });
      await prescription.save();
      this.logger.log(`Saved prescriptions documents`);
    } catch (e) {
      this.logger.error(`Error occurred uploading documents, ${e}`);
      throw new InternalServerErrorException(e);
    }
  }

  reduce(arr) {
    return arr.reduce((prevVal, currVal) => prevVal + currVal?.total, 0);
  }
}
