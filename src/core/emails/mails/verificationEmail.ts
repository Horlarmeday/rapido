import { mailGenerator } from '../mailgen';
import { Types } from 'mongoose';

type VerificationEmailType = {
  firstname: string;
  token: string;
  userId: Types.ObjectId;
  baseUrl: string;
};

export const verificationEmail = ({
  firstname,
  token,
  userId,
  baseUrl = <string>process.env.BASE_URL,
}: VerificationEmailType) => {
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
          link: `${baseUrl}/email-verification?token=${token}&userId=${userId}`,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return mailGenerator.generate(email);
};
