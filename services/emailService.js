import nodemailder from 'nodemailer';

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

const transport = nodemailder.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ from, to, subject, text }) => {
  const options = {
    from,
    to,
    subject,
    text,
  };

  await transport.sendMail(options);
};

export default sendEmail;
