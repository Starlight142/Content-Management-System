const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const TeamActivity = require('../../database/models/TeamActivity');
const { broadcast } = require('../../services/presence.service');

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'MEMBER',
    });

    try {
      await TeamActivity.create({
        teamId: null,
        actor: newUser._id,
        actionType: 'USER_CREATED',
        title: `ผู้ใช้งานใหม่ลงทะเบียน: ${newUser.username} (${newUser.firstName || ''} ${newUser.lastName || ''})`.trim(),
        details: `อีเมล: ${newUser.email}, บทบาท: ${newUser.role}`,
        entityId: newUser._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging user registration failed:', logErr.message);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT Payload
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    // Sign Token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    try {
      await TeamActivity.create({
        teamId: user.teamId || null,
        actor: user._id,
        actionType: 'USER_LOGIN',
        title: `${user.firstName || user.username} เข้าสู่ระบบสำเร็จ`,
        details: `อีเมล: ${user.email} (บทบาท: ${user.role})`,
        entityId: user._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging login failed:', logErr.message);
    }

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

module.exports = {
  register,
  login,
};
