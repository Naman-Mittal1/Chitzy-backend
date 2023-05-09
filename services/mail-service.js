const nodemailer = require('nodemailer');
class MailService {
    async sendMail(mailOptions) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.sendMail(mailOptions);
    }
}

module.exports = new MailService();