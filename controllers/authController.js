const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../services/emailService');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) throw new Error('Email already exists');

        user = new User({ username, email, password });
        user.generateVerificationToken();
        await user.save();

        await sendVerificationEmail(user, user.verificationToken);
        res.status(201).json({ message: 'Verification email sent' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        const token = generateToken(user._id);
        res.json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Resend Verification Email
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

        user.generateVerificationToken();
        await user.save();
        await sendVerificationEmail(user, user.verificationToken);

        res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
