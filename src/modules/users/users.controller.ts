import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { sendSuccessResponse } from '../../core/responses/success.responses';
import { Messages } from '../../core/messages/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { DoesUserExist } from '../../core/guards/doesUserExist.guards';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryDto } from '../../common/helpers/url-query.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Types } from 'mongoose';
import { ProfessionalPracticeSetupDto } from './dto/professional-practice-setup.dto';
import { SpecialistAvailabilityDto } from './dto/specialist-availability.dto';
import { SpecialistPreferencesDto } from './dto/specialist-preferences.dto';
import { CreateAwardDto } from './dto/create-award.dto';
import { CreateCertificationsDto } from './dto/create-certifications.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(DoesUserExist)
  @Post()
  async register(@Body() createUserDto: CreateUserDto, @Request() req) {
    const result = await this.usersService.register(
      createUserDto,
      req.get('origin'),
    );
    return sendSuccessResponse(Messages.ACCOUNT_CREATED, result);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findCurrentUser(@Request() req) {
    const result = await this.usersService.getProfile(req.user);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async profileSetup(@Body() profileSetupDto: ProfileSetupDto, @Request() req) {
    const result = await this.usersService.profileSetup(
      req.user.sub,
      profileSetupDto,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Query() queryDto: QueryDto) {
    const result = await this.usersService.getUsers(queryDto);
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('specialist-profile-setup')
  async specialistProfileSetup(
    @Body() professionalPracticeSetupDto: ProfessionalPracticeSetupDto,
    @Request() req,
  ) {
    const result = await this.usersService.specialistProfileSetup(
      professionalPracticeSetupDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('awards')
  async addAward(@Body() createAwardDto: CreateAwardDto, @Request() req) {
    const result = await this.usersService.addAward(
      createAwardDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('certifications')
  async addCertifications(
    @Body() createCertificationsDto: CreateCertificationsDto,
    @Request() req,
  ) {
    const result = await this.usersService.addCertifications(
      createCertificationsDto,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @Param('id') id: Types.ObjectId,
  ) {
    const result = await this.usersService.updateUserProfile(
      updateUserProfileDto,
      id,
    );
    return sendSuccessResponse(Messages.UPDATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: Types.ObjectId) {
    const result = await this.usersService.findOne({ _id: id });
    return sendSuccessResponse(Messages.RETRIEVED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('pre-existing-conditions/:id')
  async removePreExistingCondition(
    @Param('id') conditionId: Types.ObjectId,
    @Request() req,
  ) {
    const result = await this.usersService.removePreExistingCondition(
      conditionId,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.DELETED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('emergency-contacts/:id')
  async removeEmergencyContact(
    @Param('id') emergencyContactId: Types.ObjectId,
    @Request() req,
  ) {
    const result = await this.usersService.removeEmergencyContacts(
      emergencyContactId,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.DELETED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('dependants/:id')
  async removeDependants(
    @Param('id') dependantId: Types.ObjectId,
    @Request() req,
  ) {
    const result = await this.usersService.removeDependants(
      dependantId,
      req.user.sub,
    );
    return sendSuccessResponse(Messages.DELETED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('availability')
  async timeAvailability(
    @Body() specialistAvailabilityDto: SpecialistAvailabilityDto,
    @Request() req,
  ) {
    const result = await this.usersService.createTimeAvailability(
      req.user.sub,
      specialistAvailabilityDto,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async patientPreferences(
    @Body() specialistPreferencesDto: SpecialistPreferencesDto,
    @Request() req,
  ) {
    const result = await this.usersService.createPatientPreferences(
      req.user.sub,
      specialistPreferencesDto,
    );
    return sendSuccessResponse(Messages.CREATED, result);
  }
}
