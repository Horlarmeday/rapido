import { mailGenerator } from '../mailgen';
import { Types } from 'mongoose';

export const forgotPasswordEmail = (
  firstname: string,
  token: string,
  userId: Types.ObjectId,
) => {
  const email = {
    body: {
      name: firstname,
      intro:
        'You have received this email because a password reset request for your account was received.',
      action: {
        instructions: 'Click the button below to reset your password:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset Password',
          link: `${process.env.BASE_URL}/forgot-password?token=${token}&userId=${userId}`,
        },
      },
      outro:
        'If you did not request a password reset, no further action is required on your part.',
    },
  };
  return mailGenerator.generate(email);
};
