import { File } from '../entities/pre-existing-condition.entity';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}
export enum MaritalStatus {
  MARRIED = 'Married',
  SINGLE = 'Single',
  DIVORCED = 'Divorced',
  WIDOW = 'Widow',
  WIDOWER = 'Widower',
}

export enum Relationship {
  BROTHER = 'Brother',
  SISTER = 'Sister',
  WIFE = 'Wife',
  HUSBAND = 'Husband',
  FATHER = 'Father',
  MOTHER = 'Mother',
  UNCLE = 'Uncle',
  AUNTY = 'Aunty',
  SON = 'Son',
  DAUGHTER = 'Daughter',
  FRIEND = 'Friend',
}

export class BasicHealthInfo {
  height: {
    value: number;
    unit: string;
  };
  weight: {
    value: number;
    unit: string;
  };
}

export class HealthRiskFactors {
  is_smoker?: boolean | string;
  weight_status?: string;
  has_recent_injuries?: boolean | string;
}

export class Phone {
  country_code: string;
  number: string;
}

export class Profile {
  first_name: string;
  last_name: string;
  password?: string;
  date_of_birth: Date;
  gender?: Gender;
  contact: {
    email: string;
    phone: Phone;
    address1: string;
    address2?: string;
    state: string;
    country: string;
    zip_code: string;
  };
  marital_status?: MaritalStatus;
  basic_health_info: BasicHealthInfo;
  health_risk_factors: HealthRiskFactors;
  twoFA_secret?: string;
  profile_photo: string;
}

export class ProfessionalPractice {
  category: SpecialistCategories;
  area_of_specialty: string;
  university: {
    name: string;
    start_year: Date;
    end_year: Date;
  };
  place_of_housemanship: {
    name: string;
    start_year: Date;
    end_year: Date;
  };
  license_number: string;
  years_of_practice: string;
}

export class Documents {
  type_of_document: string;
  url: string;
  file_type: string;
  original_name: string;
}

export class Award {
  title: string;
  description: string;
  date: string;
  file: File[];
}

export enum SpecialistCategories {
  MEDICAL_DOCTOR = 'Medical Doctor',
  THERAPIST = 'Therapist',
  DIETITIAN = 'Dietitian',
  CARE_GIVER = 'Care Giver',
  PHARMACIST = 'Pharmacist',
  LAB_TECHNICIAN = 'Lab Technician',
}

export enum PaymentStructure {
  SIXTY_FORTY_SPLIT = '60/40',
  SIXTY_FIVE_THIRTY_FIVE_SPLIT = '65/35',
  SEVENTY_THIRTY_SPLIT = '70/30',
  SEVENTY_FIVE_TWENTY_FIVE_SPLIT = '75/25',
  FREE_CONSULTATIONS = 'Free Consultations',
}

export class Security {
  question: string;
  answer: string;
}
