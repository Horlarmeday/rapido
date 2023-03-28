import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { MakeBankDefaultDto } from './dto/make-bank-default.dto';
import { DeleteBankDto } from './dto/delete-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResolveAccountDto } from './dto/resolve-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  async createBankAccount(
    @Body() createBankDto: CreateBankDto,
    @Request() req,
  ) {
    const result = await this.banksService.createBank(
      createBankDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @Get()
  async getUserBanks(@Request() req) {
    const result = await this.banksService.getUserBanks(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('list')
  async listBanks() {
    const result = await this.banksService.listBanks();
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Get('default')
  async getUserDefaultBank(@Request() req) {
    const result = await this.banksService.getUserDefaultBank(req.user.sub);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @Patch('default')
  async makeBankAccountDefault(@Body() makeBankDefaultDto: MakeBankDefaultDto) {
    const result = await this.banksService.makeBankAccountDefault(
      makeBankDefaultDto.bankId,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @Delete(':id')
  async deleteBankAccount(@Body() deleteBankDto: DeleteBankDto) {
    const result = await this.banksService.deleteBankAccount(
      deleteBankDto.bankId,
    );
    return sendSuccessResponse(Messages.DELETED, result);
  }

  @Post('resolve-account')
  async resolveAccount(@Body() resolveAccountDto: ResolveAccountDto) {
    const result = await this.banksService.resolveAccount(resolveAccountDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }
}
