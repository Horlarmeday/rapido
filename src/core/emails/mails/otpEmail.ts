import { mailGenerator } from '../mailgen';

export const otpEmail = (firstname: string, token: string) => {
  const email = {
    body: {
      name: firstname,
      intro:
        'You have received this email because you have requested to login to your account.',
      action: {
        instructions: 'Kindly enter the following code when prompted:',
        button: {
          color: '#22BC66', // Optional action button color
          text: token,
          link: '#',
        },
      },
      outro:
        'If you did not initiated this request, no further action is required on your part.',
    },
  };
  return mailGenerator.generate(email);
};
