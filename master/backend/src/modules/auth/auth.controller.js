const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const Team = require('../../database/models/Team');
const TeamActivity = require('../../database/models/TeamActivity');
const { broadcast } = require('../../services/presence.service');

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, teamCode } = req.body;

    // Validate team code
    if (!teamCode || !teamCode.trim()) {
      return res.status(400).json({ message: 'กรุณาระบุรหัสสำหรับเข้าทีม (Team Code is required)' });
    }

    const cleanCode = teamCode.trim().toUpperCase();
    let targetTeam = await Team.findOne({
      $or: [
        { code: cleanCode },
        { name: new RegExp(cleanCode, 'i') },
      ],
    });

    if (!targetTeam) {
      if (cleanCode === 'TEAM-A' || cleanCode === 'TEAMA' || cleanCode === 'A') {
        targetTeam = await Team.findOne({ name: /Team A/i });
      } else if (cleanCode === 'TEAM-B' || cleanCode === 'TEAMB' || cleanCode === 'B') {
        targetTeam = await Team.findOne({ name: /Team B/i });
      }
    }

    if (!targetTeam) {
      return res.status(400).json({
        message: `ไม่พบทีมที่ตรงกับรหัส "${teamCode}" กรุณาตรวจสอบรหัสเข้าร่วมทีม (เช่น TEAM-A หรือ TEAM-B)`,
      });
    }

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

    // Create user in MongoDB associated with team
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: role || 'MEMBER',
      teamId: targetTeam._id,
    });

    // Add user into target team's members array
    targetTeam.members.push({
      user: newUser._id,
      roleInTeam: role === 'MANAGER' ? 'LEAD' : 'MEMBER',
      joinedAt: new Date(),
    });
    await targetTeam.save();

    try {
      await TeamActivity.create({
        teamId: targetTeam._id,
        actor: newUser._id,
        actionType: 'USER_CREATED',
        title: `ผู้ใช้งานใหม่เข้าร่วมทีม ${targetTeam.name}: ${newUser.username} (${newUser.firstName || ''} ${newUser.lastName || ''})`.trim(),
        details: `อีเมล: ${newUser.email}, บทบาท: ${newUser.role}, รหัสทีม: ${cleanCode}`,
        entityId: newUser._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
      broadcast('USER_CREATED', { userId: newUser._id, teamId: targetTeam._id });
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
        teamId: targetTeam._id,
        teamName: targetTeam.name,
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
    const user = await User.findOne({ email: email.toLowerCase() }).populate('teamId');
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

    let userTeamId = user.teamId && user.teamId._id ? user.teamId._id : user.teamId;
    let teamName = user.teamId && user.teamId.name ? user.teamId.name : undefined;

    if (!userTeamId) {
      const foundTeam = await Team.findOne({ 'members.user': user._id });
      if (foundTeam) {
        userTeamId = foundTeam._id;
        teamName = foundTeam.name;
      }
    }

    try {
      await TeamActivity.create({
        teamId: userTeamId || null,
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
        teamId: userTeamId,
        teamName,
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
