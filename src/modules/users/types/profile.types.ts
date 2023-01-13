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

export type Profile = {
  first_name: string;
  last_name: string;
  password?: string;
  date_of_birth: Date;
  gender?: Gender;
  contact: {
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
    address: {
      address1: string;
      address2?: string;
      state: string;
      country: string;
      zip_code: string;
    };
  };
  marital_status?: MaritalStatus;
  basic_health_info: {
    height: number;
    weight: number;
  };
  health_risk_factors: {
    is_smoker: boolean;
  };
};
