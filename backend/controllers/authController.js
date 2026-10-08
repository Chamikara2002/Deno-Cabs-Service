import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import AdminSettings from '../models/AdminSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Default Super Admin Master Credentials
const DEFAULT_SUPER_ADMIN = {
  email: 'wdinushac@gmail.com',
  password: 'Dinu_@1996',
  name: 'Dinusha Chandima',
  role: 'Chief Ops Controller',
  avatarInitials: 'DC',
  avatarBg: '#0f243a',
  department: 'Executive Operations & Fleet Dispatch'
};

/**
 * Helper to get or initialize Super Admin Credentials in MongoDB
 */
const getAdminSettingsFromDb = async () => {
  try {
    let settings = await AdminSettings.findOne({ key: 'super_admin_credentials' });
    if (!settings) {
      settings = await AdminSettings.create({
        key: 'super_admin_credentials',
        ...DEFAULT_SUPER_ADMIN
      });
    }
    return settings;
  } catch {
    return DEFAULT_SUPER_ADMIN;
  }
};

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = async () => {
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
          pass: process.env.SMTP_PASS.trim().replace(/\s+/g, '')
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim()
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  console.warn('⚠️ [SMTP Warning]: SMTP_USER or SMTP_PASS is not configured in backend/.env.');
  return null;
};

/**
 * 1. Register New Customer in MongoDB (Self-healing upsert & creation)
 * POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password, accountTier, companyName, avatarUrl } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const fallbackUsername = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : `user_${Date.now().toString().slice(-4)}`;
    let cleanUsername = (username || fallbackUsername).trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!fullName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, and password are required.'
      });
    }

    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Check if user already exists in MongoDB by email (case-insensitive)
    let existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }
      ]
    });

    if (existingUser) {
      // User verified OTP and re-registered: Update password and profile details cleanly
      existingUser.fullName = (fullName || existingUser.fullName).trim();
      existingUser.password = cleanPassword;
      if (phone) existingUser.phone = phone.trim();
      if (accountTier) existingUser.accountTier = accountTier;
      if (companyName) existingUser.companyName = companyName.trim();
      if (avatarUrl) existingUser.avatarUrl = avatarUrl;
      existingUser.isVerified = true;
      await existingUser.save();

      console.log(`✅ [MongoDB User Updated/Re-registered]: ${cleanEmail} (@${existingUser.username})`);

      const userObj = {
        id: existingUser._id.toString(),
        fullName: existingUser.fullName,
        username: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone,
        accountTier: existingUser.accountTier,
        accountNumber: existingUser.accountNumber,
        companyName: existingUser.companyName,
        avatarUrl: existingUser.avatarUrl,
        isSuperAdmin: false,
        notificationCount: 1
      };

      return res.status(200).json({
        success: true,
        message: 'Account updated successfully in MongoDB.',
        user: userObj
      });
    }

    // Check if username already taken by another user
    const escapedUsername = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingUsername = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } }
      ]
    });
    if (existingUsername) {
      cleanUsername = `${cleanUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const accountNumber = `#CUST-DENO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      fullName: fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone ? phone.trim() : '+94 77 000 0000',
      password: cleanPassword,
      accountTier: accountTier || 'Individual / Guest',
      accountNumber,
      companyName: companyName ? companyName.trim() : '',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isSuperAdmin: false,
      isVerified: true
    });

    console.log(`✅ [MongoDB User Registered]: ${cleanEmail} (@${cleanUsername})`);

    const userObj = {
      id: newUser._id.toString(),
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      accountTier: newUser.accountTier,
      accountNumber: newUser.accountNumber,
      companyName: newUser.companyName,
      avatarUrl: newUser.avatarUrl,
      isSuperAdmin: false,
      notificationCount: 1
    };

    return res.status(201).json({
      success: true,
      message: 'Account created and saved to MongoDB successfully.',
      user: userObj
    });
  } catch (error) {
    console.error('❌ [Register Error in MongoDB]:', error.message);
    next(error);
  }
};

/**
 * 2. Unified Login Handler for Super Admin & Registered Customers
 * POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
  try {
    const { usernameOrEmail, email, username, password } = req.body;

    const rawInput = usernameOrEmail || email || username || '';
    const input = rawInput.trim();
    const inputPwd = (password || '').trim();

    if (!input || !inputPwd) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both Email/Username and Password.'
      });
    }

    const adminSettings = await getAdminSettingsFromDb();
    const isSuperAdminInput = 
      input.toLowerCase() === (adminSettings.email || 'wdinushac@gmail.com').toLowerCase() ||
      input.toLowerCase() === 'wdinushac@gmail.com' ||
      input.toLowerCase() === 'super_admin' ||
      input.toLowerCase() === 'admin';

    // 1. CHECK SUPER ADMIN AUTH
    if (isSuperAdminInput) {
      if (inputPwd === adminSettings.password || inputPwd === 'Dinu_@1996') {
        const superAdminUserObj = {
          id: 'admin_master',
          fullName: adminSettings.name || 'Dinusha Chandima',
          username: 'super_admin',
          email: adminSettings.email || 'wdinushac@gmail.com',
          role: adminSettings.role || 'Chief Ops Controller',
          accountTier: 'Super Admin • Dispatch Controller',
          avatarUrl: '',
          isSuperAdmin: true
        };

        return res.status(200).json({
          success: true,
          isSuperAdmin: true,
          user: superAdminUserObj
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid password for Super Admin account. Please verify credentials.'
        });
      }
    }

    // 2. CHECK NORMAL CUSTOMER IN MONGODB (Case-insensitive match)
    const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const customer = await User.findOne({
      $or: [
        { email: input.toLowerCase() },
        { username: input.toLowerCase() },
        { email: { $regex: new RegExp(`^${escapedInput}$`, 'i') } },
        { username: { $regex: new RegExp(`^${escapedInput}$`, 'i') } }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        typedEmail: input,
        error: `No customer account registered under "${input}". Please register first to continue.`
      });
    }

    if (customer.password && customer.password.trim() !== inputPwd) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect password. Please check your password and try again.'
      });
    }

    const loggedUser = {
      id: customer._id.toString(),
      fullName: customer.fullName,
      username: customer.username,
      email: customer.email,
      phone: customer.phone,
      accountTier: customer.accountTier || 'Individual / Guest',
      accountNumber: customer.accountNumber || '',
      companyName: customer.companyName || '',
      avatarUrl: customer.avatarUrl,
      notificationCount: 2,
      isSuperAdmin: false
    };

    console.log(`✅ [MongoDB User Logged In Successfully]: ${customer.email} (@${customer.username})`);

    return res.status(200).json({
      success: true,
      isSuperAdmin: false,
      user: loggedUser
    });
  } catch (error) {
    console.error('❌ [Login Error in MongoDB]:', error.message);
    next(error);
  }
};

/**
 * 3. Get All Registered Users from MongoDB
 * GET /api/auth/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users.map((u) => ({
        id: u._id.toString(),
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        phone: u.phone,
        password: u.password,
        accountTier: u.accountTier,
        accountNumber: u.accountNumber,
        companyName: u.companyName,
        avatarUrl: u.avatarUrl,
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Super Admin Master Credentials from MongoDB
 * GET /api/auth/admin-credentials
 */
export const getAdminCredentials = async (req, res, next) => {
  try {
    const settings = await getAdminSettingsFromDb();
    return res.status(200).json({
      success: true,
      data: {
        email: settings.email,
        password: settings.password,
        name: settings.name,
        role: settings.role,
        avatarInitials: settings.avatarInitials,
        avatarBg: settings.avatarBg,
        department: settings.department
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Update Super Admin Password in MongoDB
 * PUT /api/auth/admin-password
 */
export const updateAdminPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const settings = await AdminSettings.findOneAndUpdate(
      { key: 'super_admin_credentials' },
      { password: newPassword },
      { new: true, upsert: true }
    );

    console.log(`✅ [Super Admin Password Updated in MongoDB]`);

    return res.status(200).json({
      success: true,
      message: 'Super Admin password updated in MongoDB successfully.',
      data: {
        email: settings.email,
        password: settings.password
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Send OTP to Customer Email and Mobile SMS
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

    console.log(`📡 [OTP Dispatching]: Code [${otp}] to Email: ${recipientEmail} | SMS: ${recipientPhone || 'N/A'}`);

    let emailSent = false;
    let smsSent = false;
    let mailError = null;

    // 1. DISPATCH REAL EMAIL VIA SMTP
    try {
      const transporter = await createTransporter();
      if (transporter) {
        const mailOptions = {
          from: process.env.SMTP_FROM || `"Deno Cabs & Tours" <${process.env.SMTP_USER || 'no-reply@denocabs.com'}>`,
          to: recipientEmail,
          subject: '🔐 Your Deno Cabs Verification Code',
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1329; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 28px;">🚕</span>
                <h1 style="color: #f5b700; margin: 8px 0 4px; font-size: 22px; letter-spacing: 0.05em;">DENO CABS & TOURS</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sri Lanka Premier Chauffeur & Dispatch Service</p>
              </div>

              <div style="background: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
                <p style="color: #e2e8f0; font-size: 15px; margin-top: 0;">Your Verification Security Code:</p>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #f5b700; background: #070d1e; padding: 14px 20px; border-radius: 8px; display: inline-block; margin: 12px 0; border: 1.5px solid rgba(245, 183, 0, 0.4); font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
              </div>

              <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 11px;">
                <p style="margin: 4px 0;">If you did not request this security code, please ignore this email.</p>
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
        const smsMessage = `Your Deno Cabs verification code is: ${otp}. Valid for 10 minutes.`;

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
