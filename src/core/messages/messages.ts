export enum Messages {
  ACCOUNT_CREATED = 'Account has been created successfully',
  CREATED = 'Data created',
  RETRIEVED = 'Data retrieved',
  UPDATED = 'Data updated',
  DELETED = 'Data deleted',
  INVALID_CREDENTIALS = 'Invalid user credentials',
  NOT_FOUND = 'Data not found',
  NO_USER_FOUND = 'No user found',
  UNAUTHORIZED = 'You are not authorized to access this resource',
  USER_EXISTS = 'Account already exists',
  USER_AUTHENTICATED = 'User authenticated',
  NO_GOOGLE_USER = 'No Google user found',
  NO_APPLE_USER = 'No Apple user found',
  SOCIAL_MEDIA_LOGIN = 'Invalid login, please login via other medium',
  INVALID_TOKEN = 'Invalid token',
  INVALID_AUTH_CODE = 'Invalid authentication code',
  EMAIL_VERIFICATION = 'Email Verification',
  FORGOT_PASSWORD = 'Forgot Password',
  EMAIL_VERIFIED = 'Email Verified',
  PHONE_VERIFIED = 'Phone Verified',
  INVALID_EXPIRED_TOKEN = 'Invalid or expired token, get a valid token',
  INVALID_EXPIRED_CODE = 'Invalid or expired code',
  EMAIL_VERIFICATION_SENT = 'Email verification sent',
  PHONE_VERIFICATION_SENT = 'Phone verification sent',
  PASSWORD_RESET_SENT = 'Password reset sent',
  PASSWORD_RESET = 'Password Reset Successfully',
  LOGIN_VERIFICATION = 'Rapid Capsules Login Verification',
  EMAIL_OTP_SENT = 'OTP has been sent to your email, kindly verify',
  PHONE_OTP_SENT = 'OTP has been sent to your phone, kindly verify',
  TWOFA_OTP_SENT = 'Open your Auth app, pick the verification code and verify',
  LOGIN_VERIFIED = 'Login verified',
  EMAIL_NOT_VERIFIED = 'Email not verified, please check your inbox for email verification link',
  TWO_FA_TURNED_ON = 'Two Factor Authentication turned on',
  EMAIL_ALREADY_VERIFIED = 'Email is verified already, please login',
  ERROR_OCCURRED_TRANSFER = 'Error occurred transferring funds',
  TRANSACTION_INITIALIZED = 'Transaction initialized',
  TRANSACTION_VERIFIED = 'Transaction verified',
}
