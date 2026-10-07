const crypto = require('crypto');
const Team = require('../database/models/Team');
const User = require('../database/models/User');
const Task = require('../database/models/Task');
const TeamActivity = require('../database/models/TeamActivity');
const { getOnlineUserIds, broadcast } = require('./presence.service');

/**
 * Generate a cryptographically secure 6-character alphanumeric join code.
 * Example: 'K7P92X'
 */
const generateUniqueJoinCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0, O, 1, I
  let joinCode = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const randomBytes = crypto.randomBytes(6);
    joinCode = '';
    for (let i = 0; i < 6; i++) {
      joinCode += chars[randomBytes[i] % chars.length];
    }

    const existing = await Team.findOne({ joinCode });
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    joinCode = `TM${Date.now().toString(36).substring(4).toUpperCase()}`;
  }

  return joinCode;
};

/**
 * Create a new team workspace
 */
const createTeam = async ({ name, description, leaderId, code }) => {
  if (!name || !name.trim()) {
    throw new Error('กรุณาระบุชื่อทีม (Team name is required)');
  }

  const joinCode = await generateUniqueJoinCode();
  const cleanCode = (code && code.trim())
    ? code.trim().toUpperCase()
    : `TEAM-${joinCode.substring(0, 4)}`;

  const teamData = {
    name: name.trim(),
    code: cleanCode,
    joinCode,
    description: description ? description.trim() : '',
    status: 'ACTIVE',
    members: [],
  };

  if (leaderId) {
    teamData.leader = leaderId;
    teamData.members.push({
      user: leaderId,
      roleInTeam: 'LEAD',
      joinedAt: new Date(),
    });
  }

  const team = await Team.create(teamData);

  // If leader provided, set primary teamId on user
  if (leaderId) {
    await User.findByIdAndUpdate(leaderId, { teamId: team._id });

    // Log Activity
    try {
      const leader = await User.findById(leaderId);
      const leaderName = leader ? `${leader.firstName || leader.username}` : 'ผู้จัดการ';
      await TeamActivity.create({
        teamId: team._id,
        actor: leaderId,
        actionType: 'TEAM_CREATED',
        title: `${leaderName} สร้างทีมใหม่: "${team.name}" (รหัส: ${team.joinCode})`,
        details: `รหัสเข้าร่วมทีม: ${team.joinCode}, รหัสอ้างอิง: ${team.code}`,
        entityId: team._id,
        entityModel: 'Team',
      });
      broadcast('ACTIVITY_CREATED', { teamId: team._id });
    } catch (logErr) {
      console.warn('Logging team creation failed:', logErr.message);
    }
  }

  return team;
};

/**
 * Join team by 6-character Join Code
 */
const joinTeamByCode = async (userId, joinCode) => {
  if (!joinCode || !joinCode.trim()) {
    throw new Error('กรุณาระบุรหัสเข้าร่วมทีม 6 หลัก (Join Code is required)');
  }

  const cleanCode = joinCode.trim().toUpperCase();

  // Find team by joinCode (or fallback to code for seeds like TEAM-A)
  let team = await Team.findOne({
    $or: [
      { joinCode: cleanCode },
      { code: cleanCode },
    ],
  });

  if (!team) {
    throw new Error(`ไม่พบทีมที่ตรงกับรหัส "${cleanCode}" กรุณาตรวจสอบรหัสเข้าร่วมทีมอีกครั้ง`);
  }

  if (team.status !== 'ACTIVE') {
    throw new Error('ทีมนี้ถูกระงับการใช้งานหรือปิดรับสมาชิกแล้ว');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งานในระบบ');
  }

  // Check if already in this team
  const isAlreadyMember = team.members.some(
    (m) => m.user && m.user.toString() === userId.toString()
  );

  if (isAlreadyMember) {
    // Ensure user.teamId is pointing here
    if (!user.teamId || user.teamId.toString() !== team._id.toString()) {
      user.teamId = team._id;
      await user.save();
    }
    return { team, user, message: 'คุณเป็นสมาชิกของทีมนี้อยู่แล้ว' };
  }

  // Single active team policy: remove from previous team if applicable
  if (user.teamId && user.teamId.toString() !== team._id.toString()) {
    await Team.findByIdAndUpdate(user.teamId, {
      $pull: { members: { user: userId } },
    });
  }

  // Determine roleInTeam based on position / role
  let roleInTeam = 'MEMBER';
  if (user.role === 'MANAGER' || (team.members.length === 0)) {
    roleInTeam = 'LEAD';
  } else if (user.position === 'Video Editor') {
    roleInTeam = 'EDITOR';
  } else if (user.position === 'Graphic Designer') {
    roleInTeam = 'DESIGNER';
  } else if (user.position === 'Script Writer' || user.position === 'Content Creator') {
    roleInTeam = 'CREATOR';
  }

  // Add to team members
  team.members.push({
    user: userId,
    roleInTeam,
    joinedAt: new Date(),
  });
  await team.save();

  // Update user teamId
  user.teamId = team._id;
  await user.save();

  // Record TeamActivity
  try {
    const memberName = `${user.firstName || user.username} ${user.lastName || ''}`.trim();
    await TeamActivity.create({
      teamId: team._id,
      actor: userId,
      actionType: 'TEAM_JOINED',
      title: `${memberName} เข้าร่วมทีม "${team.name}"`,
      details: `ตำแหน่ง: ${user.position || 'Member'}, บทบาทในทีม: ${roleInTeam}`,
      entityId: userId,
      entityModel: 'User',
    });
    broadcast('ACTIVITY_CREATED', { teamId: team._id });
    broadcast('USER_UPDATED', { userId, teamId: team._id });
  } catch (logErr) {
    console.warn('Logging team join failed:', logErr.message);
  }

  const populatedTeam = await Team.findById(team._id)
    .populate('members.user', 'username email firstName lastName position role workingStatus isOnline');

  return { team: populatedTeam, user, message: `เข้าร่วมทีม ${team.name} สำเร็จ` };
};

/**
 * Regenerate Join Code for a team (Manager/Leader or Admin only)
 */
const regenerateJoinCode = async (teamId, requestingUserId, userRole) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new Error('ไม่พบข้อมูลทีม');
  }

  const isLeader = team.leader && team.leader.toString() === requestingUserId.toString();
  const isManagerInTeam = team.members.some(
    (m) => m.user && m.user.toString() === requestingUserId.toString() && m.roleInTeam === 'LEAD'
  );

  if (userRole !== 'ADMIN' && !isLeader && !isManagerInTeam) {
    throw new Error('ไม่มีสิทธิ์สร้างรหัสเข้าร่วมทีมใหม่ (เฉพาะหัวหน้าทีมหรือผู้ดูแลระบบ)');
  }

  const newJoinCode = await generateUniqueJoinCode();
  team.joinCode = newJoinCode;
  await team.save();

  try {
    const requester = await User.findById(requestingUserId);
    const requesterName = requester ? `${requester.firstName || requester.username}` : 'หัวหน้าทีม';
    await TeamActivity.create({
      teamId: team._id,
      actor: requestingUserId,
      actionType: 'JOIN_CODE_REGENERATED',
      title: `${requesterName} ออกรหัสเข้าร่วมทีมใหม่: ${newJoinCode}`,
      details: `รหัสเข้าร่วมทีมเดิมถูกยกเลิกแล้วและแทนที่ด้วย ${newJoinCode}`,
      entityId: team._id,
      entityModel: 'Team',
    });
    broadcast('ACTIVITY_CREATED', { teamId: team._id });
  } catch (logErr) {
    console.warn('Logging code regeneration failed:', logErr.message);
  }

  return { teamId: team._id, joinCode: newJoinCode };
};

/**
 * Aggregate Team Dashboard stats & overview
 */
const getTeamDashboard = async (teamId, userId) => {
  const team = await Team.findById(teamId)
    .populate('members.user', 'username email firstName lastName position role workingStatus isOnline lastActiveAt');

  if (!team) {
    throw new Error('ไม่พบข้อมูลทีม');
  }

  const onlineIds = new Set(getOnlineUserIds());

  // Tasks in this team
  const teamTasks = await Task.find({ teamId })
    .populate('contentId', 'title platform status progress')
    .populate('assignedTo', 'username firstName lastName position workingStatus')
    .sort({ dueDate: 1 });

  const myTasks = teamTasks.filter(
    (t) => t.assignedTo && t.assignedTo._id.toString() === userId.toString()
  );

  const todoTasks = teamTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = teamTasks.filter((t) => t.status === 'IN_PROGRESS');
  const reviewTasks = teamTasks.filter((t) => t.status === 'REVIEW');
  const revisionTasks = teamTasks.filter((t) => t.status === 'REVISION');
  const doneTasks = teamTasks.filter((t) => t.status === 'DONE');

  let teamProgress = 0;
  if (teamTasks.length > 0) {
    const totalProgress = teamTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    teamProgress = Math.round(totalProgress / teamTasks.length);
  }

  const mappedMembers = (team.members || []).map((m) => {
    const u = m.user;
    const isOnline = u?._id ? (u.isOnline || onlineIds.has(String(u._id))) : false;
    return {
      _id: u?._id,
      username: u?.username,
      firstName: u?.firstName,
      lastName: u?.lastName,
      position: u?.position || 'Content Creator',
      role: u?.role || 'MEMBER',
      roleInTeam: m.roleInTeam,
      workingStatus: u?.workingStatus || 'IDLE',
      isOnline,
      lastActiveAt: u?.lastActiveAt,
    };
  });

  const onlineMembersCount = mappedMembers.filter((m) => m.isOnline).length;

  const recentActivities = await TeamActivity.find({ teamId })
    .populate('actor', 'username firstName lastName position role')
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    team: {
      _id: team._id,
      name: team.name,
      code: team.code || 'TEAM-A',
      joinCode: team.joinCode || team.code || 'TEAM01',
      description: team.description,
      leader: team.leader,
      totalMembers: team.members ? team.members.length : 0,
      status: team.status || 'ACTIVE',
    },
    members: mappedMembers,
    stats: {
      myTasksCount: myTasks.length,
      teamTasksCount: teamTasks.length,
      todoCount: todoTasks.length,
      inProgressCount: inProgressTasks.length,
      reviewCount: reviewTasks.length,
      revisionCount: revisionTasks.length,
      doneCount: doneTasks.length,
      teamProgress,
      onlineMembersCount,
    },
    recentActivities,
    tasks: teamTasks,
  };
};

module.exports = {
  generateUniqueJoinCode,
  createTeam,
  joinTeamByCode,
  regenerateJoinCode,
  getTeamDashboard,
};

