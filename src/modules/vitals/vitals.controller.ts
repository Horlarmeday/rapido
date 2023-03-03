import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalDto } from './dto/update-vital.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  async create(@Body() createVitalDto: CreateVitalDto, @Request() req) {
    const result = await this.vitalsService.createVitals(
      createVitalDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Get()
  async findUserVitals(@Request() req) {
    const result = await this.vitalsService.findUserVitals(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVitalDto: UpdateVitalDto,
  ) {
    const result = await this.vitalsService.updateVitals(id, updateVitalDto);
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.vitalsService.removeVital(id);
    return sendSuccessResponse(Messages.DELETED, result);
  }
}