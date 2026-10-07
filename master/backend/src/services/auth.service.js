const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
const Team = require('../database/models/Team');
const TeamActivity = require('../database/models/TeamActivity');
const { broadcast } = require('./presence.service');

const getJwtSecret = () => process.env.JWT_SECRET || 'supersecretjwtkey_cms2026';

/**
 * Register a new user into the platform.
 * Always defaults to role 'MEMBER'. Does not require team during registration.
 */
const registerUser = async ({ firstName, lastName, position, email, password }) => {
  if (!email || !email.trim()) {
    throw new Error('กรุณากรอกอีเมล (Email is required)');
  }
  if (!password || password.length < 6) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }
  if (!firstName || !firstName.trim()) {
    throw new Error('กรุณากรอกชื่อ (First name is required)');
  }

  const cleanEmail = email.trim().toLowerCase();
  const username = cleanEmail.split('@')[0] || `user_${Date.now()}`;

  // Check existing user
  const existing = await User.findOne({
    $or: [{ email: cleanEmail }, { username }],
  });

  if (existing) {
    throw new Error('อีเมลหรือชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น');
  }

  // Validate position
  const validPositions = [
    'Video Editor',
    'Graphic Designer',
    'Script Writer',
    'Content Creator',
    'Production Manager',
    'Other',
  ];
  const assignedPosition = validPositions.includes(position) ? position : 'Content Creator';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email: cleanEmail,
    passwordHash,
    firstName: firstName.trim(),
    lastName: lastName ? lastName.trim() : '',
    position: assignedPosition,
    role: 'MEMBER', // Strictly default to MEMBER
    status: 'ACTIVE',
    workingStatus: 'IDLE',
  });

  // Generate JWT token for immediate sign-in
  const token = jwt.sign(
    {
      userId: newUser._id,
      username: newUser.username,
      role: newUser.role,
      position: newUser.position,
      teamId: null,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      position: newUser.position,
      role: newUser.role,
      teamId: null,
      teamName: null,
      createdAt: newUser.createdAt,
    },
  };
};

/**
 * Authenticate existing user with email and password
 */
const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: cleanEmail }, { username: email.trim() }],
  }).populate('teamId', 'name code joinCode');

  if (!user) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)');
  }

  if (user.status === 'SUSPENDED') {
    throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
  }

  // Update activity status
  user.isOnline = true;
  user.lastActiveAt = new Date();
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
      position: user.position || 'Content Creator',
      teamId: user.teamId?._id || user.teamId || null,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position || 'Content Creator',
      role: user.role,
      status: user.status,
      workingStatus: user.workingStatus,
      teamId: user.teamId?._id || user.teamId || null,
      teamName: user.teamId?.name || null,
      teamCode: user.teamId?.code || null,
      joinCode: user.teamId?.joinCode || null,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};
