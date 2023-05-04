import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Referral, ReferralDocument } from './entities/referral.entity';
import { Model, Types } from 'mongoose';
import { create, findOne, upsert } from '../../common/crud/crud';
import { v4 as uuidv4 } from 'uuid';
import { Messages } from '../../core/messages/messages';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
  ) {}
  async createReferral(referrerId: Types.ObjectId) {
    let referralCode;
    let referral;
    do {
      referralCode = uuidv4();
      referral = await this.findOneByCode(referralCode);
    } while (referral);

    return await create(this.referralModel, {
      referrer: referrerId,
      referral_code: referralCode,
    });
  }

  async updateReferrals(refereeId: Types.ObjectId, referralCode: string) {
    const referral = await this.findOneByCode(referralCode);
    if (!referral)
      throw new NotFoundException(Messages.NOT_FOUND_REFERRAL_CODE);

    return upsert(
      this.referralModel,
      { referral_code: referralCode },
      { $push: { referrals: { referee: refereeId } } },
    );
  }

  async findOneByCode(code: string) {
    return await findOne(this.referralModel, { referral_code: code });
  }

  async getReferralByCode(code: string) {
    const referral = await this.findOneByCode(code);
    if (!referral)
      throw new NotFoundException(Messages.NOT_FOUND_REFERRAL_CODE);
    return referral;
  }

  async getUserReferral(referrerId: Types.ObjectId) {
    const referral = await findOne(
      this.referralModel,
      {
        referrer: referrerId,
      },
      {
        populate: 'referrals.referee',
        populateSelectFields: ['profile.first_name', 'profile.last_name'],
      },
    );
    if (!referral)
      throw new NotFoundException(Messages.USER_REFERRAL_CODE_NOT_EXISTS);
    return referral;
  }
}
