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
}

export class BasicHealthInfo {
  height: number;
  weight: number;
}

export class HealthRiskFactors {
  is_smoker: boolean | string;
  is_over_weight: boolean | string;
  has_recent_injuries: boolean | string;
}

export class Phone {
  country_code: string;
  number: string;
}

export type Profile = {
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
};
