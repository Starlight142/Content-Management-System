const authService = require('../../services/auth.service');
const teamService = require('../../services/team.service');
const TeamActivity = require('../../database/models/TeamActivity');
const { broadcast } = require('../../services/presence.service');

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, position, email, password, teamCode } = req.body;

    // 1. Register User via AuthService (forces role 'MEMBER', validates position)
    const result = await authService.registerUser({
      firstName,
      lastName,
      position,
      email,
      password,
    });

    // 2. If teamCode is optionally provided (backwards-compatibility/convenience), join team
    if (teamCode && teamCode.trim()) {
      try {
        const joinResult = await teamService.joinTeamByCode(result.user.id, teamCode.trim());
        result.user.teamId = joinResult.team._id;
        result.user.teamName = joinResult.team.name;
        result.user.teamCode = joinResult.team.code;
        result.user.joinCode = joinResult.team.joinCode;
      } catch (teamErr) {
        console.warn('Optional team join during register warning:', teamErr.message);
      }
    }

    try {
      await TeamActivity.create({
        teamId: result.user.teamId || null,
        actor: result.user.id,
        actionType: 'USER_CREATED',
        title: `ผู้ใช้งานใหม่สมัครเข้าสู่ระบบ: ${result.user.username} (${result.user.firstName || ''} ${result.user.lastName || ''})`.trim(),
        details: `อีเมล: ${result.user.email}, ตำแหน่ง: ${result.user.position || 'Content Creator'}, สิทธิ์: ${result.user.role}`,
        entityId: result.user.id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
      broadcast('USER_CREATED', { userId: result.user.id, teamId: result.user.teamId });
    } catch (logErr) {
      console.warn('Logging user registration failed:', logErr.message);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    try {
      await TeamActivity.create({
        teamId: result.user.teamId || null,
        actor: result.user.id,
        actionType: 'USER_LOGIN',
        title: `${result.user.firstName || result.user.username} เข้าสู่ระบบสำเร็จ`,
        details: `อีเมล: ${result.user.email} (ตำแหน่ง: ${result.user.position}, สิทธิ์: ${result.user.role})`,
        entityId: result.user.id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging login failed:', logErr.message);
    }

    res.status(200).json({
      message: 'Logged in successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    const isCredError = error.message.includes('Invalid credentials') || error.message.includes('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    res.status(isCredError ? 401 : 400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};
