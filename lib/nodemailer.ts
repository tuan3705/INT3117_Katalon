// Manage sending email
// lib/nodemailer.ts

import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_SERVER_USER;
const emailPass = process.env.EMAIL_SERVER_PASSWORD;

if (!emailUser || !emailPass) {
    console.warn("Email credentials not found in .env file. Password reset emails will not be sent.");
}

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

export const mailOptions = {
    from: emailUser,
};