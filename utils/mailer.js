const nodeMailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
  secure: true,
});

const sendEmail = async (toEmail, subject, content, isHtml) => {
  const mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to: toEmail,
    subject,
    [isHtml ? 'html' : 'text']: content,
  };

  await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (toEmail, resetToken, name) => {
  try {
    const templatePath = path.join(__dirname, '../app/view/resetPassword.ejs');

    ejs.renderFile(
      templatePath,
      {
        name,
        url: `${process.env.BASE_URL}/reset-password?email=${toEmail}&token=${resetToken}`,
      },
      (err, renderedTemplate) => {
        if (err) {
          console.error('Error rendering template:', err);
          return;
        }

        sendEmail(toEmail, 'Password Reset', renderedTemplate, true);
      }
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

const sendRegistrationEmail = async (toEmail, name) => {
  try {
    const templatePath = path.join(__dirname, '../app/view/success.ejs');

    ejs.renderFile(
      templatePath,
      {
        name,
      },
      (err, renderedTemplate) => {
        if (err) {
          console.error('Error rendering template:', err);
          return;
        }

        sendEmail(toEmail, 'Welcome to Big Tech', renderedTemplate, true);
      }
    );
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

const sendSuccessResetEmail = async (toEmail, name) => {
  try {
    const templatePath = path.join(__dirname, '../app/view/resetSuccess.ejs');

    ejs.renderFile(
      templatePath,
      {
        name,
      },
      (err, renderedTemplate) => {
        if (err) {
          console.error('Error rendering template:', err);
          return;
        }

        sendEmail(toEmail, 'Password Reset Successful', renderedTemplate, true);
      }
    );
  } catch (error) {
    console.error('Error sending password reset successful email:', error);
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendRegistrationEmail,
  sendSuccessResetEmail,
};
