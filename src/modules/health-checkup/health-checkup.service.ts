import { Injectable } from '@nestjs/common';
import { Infermedica } from '../../common/external/infermedica/infermedica';
import { CheckDiagnosisDto } from './dto/check-diagnosis.dto';
import { SuggestedSymptomsDto } from './dto/suggested-symptoms.dto';
import { ParseTextDto } from './dto/parse-text.dto';
import { ExplainConditionDto } from './dto/explain-condition.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  HealthCheckup,
  HealthCheckupDocument,
} from './entities/health-checkup.entity';
import { Model, Types } from 'mongoose';
import { BeginCheckupDto } from './dto/begin-checkup.dto';
import { create, updateOne } from '../../common/crud/crud';
import { SearchQueryDto } from './dto/search-query.dto';

const { ObjectId } = Types;

@Injectable()
export class HealthCheckupService {
  constructor(
    @InjectModel(HealthCheckup.name)
    private healthCheckupModel: Model<HealthCheckupDocument>,
    private readonly infermedica: Infermedica,
  ) {}

  async beginCheckup(beginCheckupDto: BeginCheckupDto, userId: Types.ObjectId) {
    const { health_check_for, checkup_owner_id } = beginCheckupDto;
    return await create(this.healthCheckupModel, {
      user: userId,
      health_check_for,
      checkup_owner_id: checkup_owner_id || new ObjectId(),
    });
  }

  async diagnosis(
    checkDiagnosisDto: CheckDiagnosisDto,
    userId: Types.ObjectId,
  ) {
    const response = await this.infermedica.diagnosis(checkDiagnosisDto);
    if (checkDiagnosisDto.should_stop) {
      const checkup = await this.healthCheckupModel
        .findOne({ userId })
        .sort({ created_at: -1 });
      if (checkup) {
        await updateOne(
          this.healthCheckupModel,
          { _id: checkup._id },
          { request: checkDiagnosisDto, response },
        );
      }
    }
    return response;
  }

  async getRiskFactors(age: number) {
    return await this.infermedica.getRiskFactors(age);
  }

  async getSuggestedSymptoms(suggestedSymptomsDto: SuggestedSymptomsDto) {
    return this.infermedica.getSuggestedSymptoms(suggestedSymptomsDto);
  }

  async parseFreeText(parseTextDto: ParseTextDto) {
    return this.infermedica.parseFreeText(parseTextDto);
  }

  async explainCondition(explainConditionDto: ExplainConditionDto) {
    return this.infermedica.explain(explainConditionDto);
  }

  async search(searchQueryDto: SearchQueryDto) {
    return this.infermedica.search(searchQueryDto);
  }
}
