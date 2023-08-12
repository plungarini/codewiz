import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v1';
import * as nm from 'nodemailer';
import { resetEmailTemplate } from './templates/reset-password.email';
import Mail = require('nodemailer/lib/mailer');

// TODO: Create email client
const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_PASSW = process.env.EMAIL_PASSW;

const generateEmailActionCode = (email: string) => {
	return admin.auth().generatePasswordResetLink(email, );
};

export const sendEmailActionCode = async (email: string) => {
	if (!email) throw new Error(`Invalid email provided: ${email}`);
	if (!SENDER_EMAIL || !SENDER_PASSW) throw new Error('Cannot login to nodemail.');

	const transport = nm.createTransport({
		service: 'Zoho',
		host: 'smtppro.zoho.com',
		port: 465,
		secure: true,
    auth: {
			user: SENDER_EMAIL,
			pass: SENDER_PASSW,
    },
	});

	try {
		await transport.verify();
	} catch (error) {
		logger.error(error);
		throw new Error('Nodemailer failed to verify SMTP server');
	}

	const emailLink = await generateEmailActionCode(email);
	const htmlTemplate = resetEmailTemplate({ resetLink: emailLink });

	const mailOptions: Mail.Options = {
		from: 'CodeWiz - Support Team <support@codewiz.app>',
		to: email,
		priority: 'high',
		sender: 'CodeWiz - Support Team <support@codewiz.app>',
		subject: 'Reset your password | CodeWiz',
		text: 'Reset your password for your account on CodeWiz',
		html: htmlTemplate,
	};

	try {
		return await transport.sendMail(mailOptions);
	} catch (error) {
		logger.error(error);
		throw new Error('Unable to send the email');
	}
};
