import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Messages } from '../../core/messages/messages';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenType } from './entities/token.entity';
import { GeneralHelpers } from '../../common/helpers/general.helpers';
import { verificationEmail } from '../../core/emails/mails/verificationEmail';

@Controller('verifications')
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly generalHelpers: GeneralHelpers,
  ) {}

  @Get('email/:userId/verify/:token')
  async emailVerify(@Param() params) {
    const { userId, token } = params;
    await this.tokensService.verifyEmailToken(userId, token);
    return sendSuccessResponse(Messages.EMAIL_VERIFIED, null);
  }

  @UseGuards(JwtAuthGuard)
  @Get('phone/verify')
  async phoneVerify(@Body() body, @Request() req) {
    const { token } = body;
    await this.tokensService.verifyPhoneToken(req.user.sub, token);
    return sendSuccessResponse(Messages.PHONE_VERIFIED, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email/resend')
  async regenerateEmailToken(@Request() req) {
    const token = await this.tokensService.create(
      TokenType.EMAIL,
      req.user.sub,
    );
    this.generalHelpers.generateEmailAndSend({
      email: req.user.email,
      subject: Messages.EMAIL_VERIFICATION,
      emailBody: verificationEmail(
        req.user.first_name,
        token.token,
        req.user.sub,
      ),
    });
    return sendSuccessResponse(Messages.EMAIL_VERIFICATION_SENT, null);
  }

  @UseGuards(JwtAuthGuard)
  @Post('phone/resend')
  async regeneratePhoneToken(@Request() req) {
    const token = await this.tokensService.create(
      TokenType.PHONE,
      req.user.sub,
    );
    // Todo: Send token SMS to phone
    return sendSuccessResponse(Messages.PHONE_VERIFICATION_SENT, null);
  }
}
