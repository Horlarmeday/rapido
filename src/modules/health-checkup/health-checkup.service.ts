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
import { create } from '../../common/crud/crud';

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

  async diagnosis(checkDiagnosisDto: CheckDiagnosisDto) {
    return await this.infermedica.diagnosis(checkDiagnosisDto);
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
}
