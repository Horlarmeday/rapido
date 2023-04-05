import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { HealthCheckupService } from './health-checkup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseTextDto } from './dto/parse-text.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { RiskFactorsDto } from './dto/risk-factors.dto';
import { SuggestedSymptomsDto } from './dto/suggested-symptoms.dto';
import { CheckDiagnosisDto } from './dto/check-diagnosis.dto';
import { ExplainConditionDto } from './dto/explain-condition.dto';
import { BeginCheckupDto } from './dto/begin-checkup.dto';

@UseGuards(JwtAuthGuard)
@Controller('health-checkup')
export class HealthCheckupController {
  constructor(private readonly healthCheckupService: HealthCheckupService) {}

  @Post()
  async beginCheckup(@Body() beginCheckupDto: BeginCheckupDto, @Request() req) {
    const result = await this.healthCheckupService.beginCheckup(
      beginCheckupDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Post('parse')
  async parseFreeText(@Body() parseTextDto: ParseTextDto) {
    const result = await this.healthCheckupService.parseFreeText(parseTextDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('risk-factors')
  async getRiskFactors(@Body() riskFactorsDto: RiskFactorsDto) {
    const result = await this.healthCheckupService.getRiskFactors(
      riskFactorsDto.age,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('symptoms')
  async getSuggestedSymptoms(
    @Body() suggestedSymptomsDto: SuggestedSymptomsDto,
  ) {
    const result = await this.healthCheckupService.getSuggestedSymptoms(
      suggestedSymptomsDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('diagnosis')
  async checkDiagnosis(@Body() checkDiagnosisDto: CheckDiagnosisDto) {
    const result = await this.healthCheckupService.diagnosis(checkDiagnosisDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Post('explain-condition')
  async explainCondition(@Body() explainConditionDto: ExplainConditionDto) {
    const result = await this.healthCheckupService.explainCondition(
      explainConditionDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
