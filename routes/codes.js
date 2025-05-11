const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Codes = require('../models/Codes');

const router = express.Router();

// Nodemailer configuration (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'duducom195@gmail.com',
    pass: 'qtxo mujt cvqa repp',
  },
});

// Route to request password reset
router.post('/codeActiveAccount', express.json(), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: 'User not found.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    const existingReset = await Codes.findOne({ where: { userId: user.id } });

    if (existingReset) {
      await existingReset.update({
        code,
        expiresAt,
      });
    } else {
      await Codes.create({
        userId: user.id,
        code,
        expiresAt,
      });
    }

    await transporter.sendMail({
      from: '"SOGOJ Support"',
      to: email,
      subject: 'Account Active Code',
      html: `<p>Hello <strong>${user.name}</strong>,</p>
             <p>Your Account active code is:</p>
             <h1>${code}</h1>
             <p>This code will expire in <strong>25 minutes</strong>.</p>
             <p>If you did not request this, please ignore this email.</p>`,
    });
    return res.json({
      success: true,
      message: 'Code sent to your email.',
      code: code
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/codeResetPassword', express.json(), async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: 'User not found.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    const existingReset = await Codes.findOne({ where: { userId: user.id } });

    if (existingReset) {
      await existingReset.update({
        code,
        expiresAt,
      });
    } else {
      await Codes.create({
        userId: user.id,
        code,
        expiresAt,
      });
    }

    await transporter.sendMail({
      from: '"SOGOJ Support"',
      to: email,
      subject: 'Password Reset Code',
      html: `<p>Hello <strong>${user.name}</strong>,</p><br>
             <p>Your username is: ${user.username}</p><br>
             <p>Your password reset code is:</p><br>
             <h1>${code}</h1><br>
             <p>This code will expire in <strong>25 minutes</strong>.</p><br>
             <p>If you did not request this, please ignore this email.</p>`,
    });
    return res.json({
      success: true,
      message: 'Code sent to your email.',
      code: code,
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/newPassword', express.json(), async (req, res) => {
  const { email, code, password, confirmPassword } = req.body;

  // Validação básica
  if (!email || !code || !password || !confirmPassword) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match.' });
  }

  try {
    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: 'User not found.' });
    }

    // Verificar o código de redefinição
    const resetRequest = await Codes.findOne({ where: { userId: user.id, code } });
    if (!resetRequest) {
      return res.json({ success: false, message: 'Invalid reset code.' });
    }

    if (resetRequest.expiresAt < new Date()) {
      return res.json({ success: false, message: 'Reset code has expired.' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Atualizar a senha do usuário
    await user.update({ password: hashedPassword });
    

    return res.json({ success: true, message: 'Password successfully updated.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.json({ success: false, message: 'Internal server error.' });
  }
});


router.post('/activeAccount', express.json(), async (req, res) => {
  const { email, code} = req.body;

  // Validação básica
  if (!email || !code) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: 'User not found.' });
    }

    // Verificar o código de redefinição
    const activeRequest = await Codes.findOne({ where: { userId: user.id, code } });
    if (!activeRequest) {
      return res.json({ success: false, message: 'Invalid active code.' });
    }

    if (activeRequest.expiresAt < new Date()) {
      return res.json({ success: false, message: 'Active code has expired.' });
    }

    user.isActive = true;
    await user.save();

    return res.json({ success: true, message: 'Your account is activated.' });
  } catch (error) {
    console.error('Error activating your account:', error);
    return res.json({ success: false, message: 'Internal server error.' });
  }
});


module.exports = router;
