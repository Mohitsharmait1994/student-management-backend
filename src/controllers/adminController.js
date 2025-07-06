// controllers/adminController.js

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// =================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists.' });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      message: 'Admin registered successfully.',
      admin
    });
  } catch (error) {
    console.error('Register error:', error);
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message || 'An unexpected error occurred during registration.'
        : 'An unexpected server error occurred. Please try again later.';
    res.status(500).json({ message });
  }
};

// =================== LOGIN ====================
exports.login = async (req, res) => {
  console.log(process.env.NODE_ENV);
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await admin.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Short-lived access token
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Long-lived refresh token
    const refreshToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in HTTP-only, secure cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    if (process.env.NODE_ENV !== 'production') {
      res.json({
        message: 'Login successful.',
        accessToken,
        refreshToken, // ✅ for debugging on localhost only
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      });
    } else {
      res.json({
        message: 'Login successful.',
        accessToken,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      });
    }
    

  } catch (error) {
    console.error('Login error:', error);
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message || 'An unexpected error occurred during login.'
        : 'An unexpected server error occurred. Please try again later.';
    res.status(500).json({ message });
  }
};

// =================== REFRESH TOKEN ====================
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found. Please log in again.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
      }

      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message || 'An unexpected error occurred during token refresh.'
        : 'An unexpected server error occurred. Please try again later.';
    res.status(500).json({ message });
  }
};

// =================== LOGOUT ====================
exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    console.error('Logout error:', error);
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message || 'An unexpected error occurred during logout.'
        : 'An unexpected server error occurred. Please try again later.';
    res.status(500).json({ message });
  }
};
