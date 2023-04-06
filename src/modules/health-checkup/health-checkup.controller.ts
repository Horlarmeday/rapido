import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import { SearchQueryDto } from './dto/search-query.dto';

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
    return sendSuccessResponse(Messages.CREATED, result?.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('parse')
  async parseFreeText(@Body() parseTextDto: ParseTextDto) {
    const result = await this.healthCheckupService.parseFreeText(parseTextDto);
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('risk-factors')
  async getRiskFactors(@Body() riskFactorsDto: RiskFactorsDto) {
    const result = await this.healthCheckupService.getRiskFactors(
      riskFactorsDto.age,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('symptoms')
  async getSuggestedSymptoms(
    @Body() suggestedSymptomsDto: SuggestedSymptomsDto,
  ) {
    const result = await this.healthCheckupService.getSuggestedSymptoms(
      suggestedSymptomsDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('diagnosis')
  async checkDiagnosis(
    @Body() checkDiagnosisDto: CheckDiagnosisDto,
    @Request() req,
  ) {
    const result = await this.healthCheckupService.diagnosis(
      checkDiagnosisDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('explain-condition')
  async explainCondition(@Body() explainConditionDto: ExplainConditionDto) {
    const result = await this.healthCheckupService.explainCondition(
      explainConditionDto,
    );
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }

  @Get('search')
  async search(@Query() searchQueryDto: SearchQueryDto) {
    const result = await this.healthCheckupService.search(searchQueryDto);
    return sendSuccessResponse(Messages.RETRIEVED, result?.data);
  }
}
