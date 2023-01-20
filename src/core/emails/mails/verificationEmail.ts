import { mailGenerator } from '../mailgen';
import { Types } from 'mongoose';

export const verificationEmail = (
  firstname: string,
  token: string,
  userId: Types.ObjectId,
) => {
  const email = {
    body: {
      name: firstname,
      intro:
        "Welcome to Rapid Capsule! We're very excited to have you on board.",
      action: {
        instructions: 'To get started with Rapid Capsule, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Confirm your account',
          link: `${process.env.BASE_URL}/api/auth/email/${userId}/verify/${token}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return mailGenerator.generate(email);
};
