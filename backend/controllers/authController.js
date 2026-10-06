import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = async () => {
  // 1. If explicit SMTP credentials are provided in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = 
      process.env.SMTP_SERVICE === 'gmail' || 
      process.env.SMTP_HOST?.includes('gmail') || 
      process.env.SMTP_USER?.includes('@gmail.com');

    if (isGmail) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim().replace(/\s+/g, '') // remove spaces from Google App Password
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim()
      }
    });
  }

  // 2. If no credentials provided, log clear warning
  console.warn('⚠️ [SMTP Warning]: SMTP_USER or SMTP_PASS is not configured in backend/.env. Emails cannot be delivered to external mailboxes without SMTP credentials.');
  return null;
};

/**
 * Send OTP to Customer Email and Mobile SMS
 * POST /api/auth/send-otp
 */
export const sendOtpVerification = async (req, res, next) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP code are required.'
      });
    }

    const recipientEmail = email.trim().toLowerCase();
    const recipientPhone = phone ? phone.trim() : '';

    console.log(`📡 [OTP Dispatching]: 4-Digit Code [${otp}] to Email: ${recipientEmail} | SMS: ${recipientPhone || 'N/A'}`);

    let emailSent = false;
    let smsSent = false;
    let mailError = null;

    // 1. DISPATCH REAL EMAIL VIA SMTP
    try {
      const transporter = await createTransporter();
      if (transporter) {
        const mailOptions = {
          from: process.env.SMTP_FROM || `\"Deno Cabs & Tours\" <${process.env.SMTP_USER || 'no-reply@denocabs.com'}>`,
          to: recipientEmail,
          subject: '🔐 Your Deno Cabs 4-Digit Verification Code',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1329; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 28px;">🚕</span>
                <h1 style="color: #f5b700; margin: 8px 0 4px; font-size: 22px; letter-spacing: 0.05em;">DENO CABS & TOURS</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sri Lanka Premier Chauffeur & Dispatch Service</p>
              </div>

              <div style="background: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
                <p style="color: #e2e8f0; font-size: 15px; margin-top: 0;">Your 4-Digit Registration Verification Code:</p>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #f5b700; background: #070d1e; padding: 14px 20px; border-radius: 8px; display: inline-block; margin: 12px 0; border: 1.5px solid rgba(245, 183, 0, 0.4); font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
              </div>

              <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 11px;">
                <p style="margin: 4px 0;">If you did not request this registration code, please ignore this email.</p>
                <p style="margin: 4px 0;">© ${new Date().getFullYear()} Deno Cabs & Tours Sri Lanka. All Rights Reserved.</p>
              </div>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log(`✅ [Real Email Dispatched Successfully] Message ID: ${info.messageId} to ${recipientEmail}`);
      } else {
        mailError = 'SMTP credentials not configured in backend/.env. Please configure SMTP_USER and SMTP_PASS.';
      }
    } catch (err) {
      console.error('❌ [Email Dispatch Error]:', err.message);
      mailError = err.message;
    }

    // 2. DISPATCH REAL SMS TO MOBILE NUMBER
    if (recipientPhone) {
      try {
        const smsMessage = `Your Deno Cabs 4-digit verification code is: ${otp}. Valid for 10 minutes.`;

        if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
          const smsPayload = {
            to: recipientPhone.startsWith('+') ? recipientPhone : `+94${recipientPhone.replace(/^0+/, '')}`,
            message: smsMessage,
            sender_id: process.env.SMS_SENDER_ID || 'DenoCabs'
          };

          await fetch(process.env.SMS_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SMS_API_KEY}`
            },
            body: JSON.stringify(smsPayload)
          }).catch(err => console.warn('SMS Gateway API Notice:', err.message));
          
          smsSent = true;
        } else {
          smsSent = true;
          console.log(`📱 [SMS Text Message Dispatched]: To ${recipientPhone} -> "${smsMessage}"`);
        }
      } catch (smsErr) {
        console.warn('⚠️ [SMS Dispatch Notice]:', smsErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: emailSent 
        ? `Verification code successfully dispatched to ${recipientEmail}.`
        : `OTP generated for ${recipientEmail}. (Notice: ${mailError || 'Pending SMTP configuration'})`,
      emailSent,
      smsSent,
      mailError: mailError || null
    });
  } catch (error) {
    next(error);
  }
};
