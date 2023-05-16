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



    async sendVerificationCode(name, email) {

        if (!email) {
            res.status(400).json({ error: "Email Field is required" });
        }



        const otp = await otpService.generateOTP();
        const otpExpirationTimeInMinutes = 5;
        const ttl = 1000 * 60 * otpExpirationTimeInMinutes;

        const expires = Date.now() + ttl;

        const data = `${email}.${otp}.${expires}`;

        const otpHash = hashService.hashOTP(data);

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Chitzy Email Verification',
                html: `
                  <p>Hi ${name},</p>
                  <p>Thank you for registering with Chitzy</p>
                  <p>Your verification code for chitzy is ${otp}</p>
                  <p>Your OTP will expire in 5 minutes</p>
                  <br />
                  <p>If you did not request this, please ignore this email.</p>
                  <p>Regards,</p>
                  <p>Team Chitzy</p>
                `,
            };
            await this.sendMail(mailOptions)
            console.log({ hash: `${otpHash}.${expires}`, email, otp });
            return res.json({ hash: `${otpHash}.${expires}`, email, otp });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: MESSGE_SENDING_FAILED });
        }

    }
}

module.exports = new MailService();