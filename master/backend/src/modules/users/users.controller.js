const bcrypt = require('bcryptjs');
const User = require('../../database/models/User');
const TeamActivity = require('../../database/models/TeamActivity');
const { notifyUserUpdated, broadcast, getOnlineUserIds } = require('../../services/presence.service');

// @route GET /api/users
// @access Private (Admin/Manager)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Sync online status with active socket connections in memory if needed
    const onlineIds = new Set(getOnlineUserIds());
    const mapped = users.map((u) => {
      const obj = u.toObject();
      if (onlineIds.has(String(u._id))) {
        obj.isOnline = true;
      }
      return obj;
    });

    res.status(200).json(mapped);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @route GET /api/users/online
// @access Private
const getOnlineUsers = async (req, res) => {
  try {
    const onlineIds = getOnlineUserIds();
    const users = await User.find({
      $or: [{ isOnline: true }, { _id: { $in: onlineIds } }],
    }).select('-passwordHash');

    res.status(200).json({
      count: users.length,
      onlineUserIds: onlineIds,
      users,
    });
  } catch (error) {
    console.error('getOnlineUsers error:', error);
    res.status(500).json({ message: 'Server error retrieving online users' });
  }
};

// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const onlineIds = new Set(getOnlineUserIds());
    const obj = user.toObject();
    if (onlineIds.has(String(user._id))) {
      obj.isOnline = true;
    }

    res.status(200).json(obj);
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// @route POST /api/users
// @access Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, username, email, role, password, position } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || '123456', salt);

    const names = (name || '').trim().split(' ');
    const firstName = names[0] || username || 'Team';
    const lastName = names.slice(1).join(' ') || 'Member';

    const newUser = await User.create({
      username: username || email.split('@')[0],
      email,
      passwordHash,
      firstName,
      lastName,
      position: position || 'Content Creator',
      role: role || 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'IDLE',
      isOnline: false,
      lastActiveAt: new Date(),
    });

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;

    try {
      const actorId = req.user?.userId || req.user?.id;
      const actorName = req.user?.firstName || req.user?.username || 'ผู้ดูแลระบบ';
      await TeamActivity.create({
        teamId: null,
        actor: actorId || null,
        actionType: 'USER_CREATED',
        title: `${actorName} เพิ่มผู้ใช้งานใหม่: ${safeUser.username}`,
        details: `อีเมล: ${safeUser.email}, บทบาท: ${safeUser.role}`,
        entityId: safeUser._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging createUser failed:', logErr.message);
    }

    broadcast('USER_CREATED', { user: safeUser });

    res.status(201).json({ message: 'User created successfully', user: safeUser });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: error.message || 'Server error creating user' });
  }
};

// @route PATCH /api/users/:id/role
// @access Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      const actorId = req.user?.userId || req.user?.id;
      const actorName = req.user?.firstName || req.user?.username || 'ผู้ดูแลระบบ';
      await TeamActivity.create({
        teamId: null,
        actor: actorId || null,
        actionType: 'USER_UPDATED',
        title: `${actorName} ปรับบทบาทของ ${user.username} เป็น ${user.role}`,
        details: `อีเมล: ${user.email}`,
        entityId: user._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging updateUserRole failed:', logErr.message);
    }

    notifyUserUpdated(user);

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// @route PATCH /api/users/:id/position
// @access Private (Admin or Manager for own team)
const updateUserPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    const validPositions = [
      'Video Editor',
      'Graphic Designer',
      'Script Writer',
      'Content Creator',
      'Production Manager',
      'Other',
    ];

    if (!position || !validPositions.includes(position)) {
      return res.status(400).json({
        message: `ตำแหน่งไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validPositions.join(', ')}`,
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = req.user?.role;
    const userTeamId = req.user?.teamId ? req.user.teamId.toString() : null;

    // RBAC check:
    // Admin can update position of anyone.
    // Manager can only update position of members within their OWN team.
    if (userRole === 'MANAGER') {
      const targetTeamId = targetUser.teamId ? targetUser.teamId.toString() : null;
      if (!userTeamId || !targetTeamId || userTeamId !== targetTeamId) {
        return res.status(403).json({
          message: 'ไม่อนุญาต: ผู้จัดการ (Manager) สามารถกำหนดตำแหน่งได้เฉพาะสมาชิกในทีมของตนเองเท่านั้น',
        });
      }
      if (targetUser.role === 'ADMIN') {
        return res.status(403).json({
          message: 'ไม่อนุญาต: ไม่สามารถแก้ไขตำแหน่งของผู้ดูแลระบบได้',
        });
      }
    } else if (userRole !== 'ADMIN') {
      return res.status(403).json({
        message: 'ไม่อนุญาต: เฉพาะผู้จัดการ (Manager) หรือผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเลือกตำแหน่งงานได้',
      });
    }

    targetUser.position = position;
    await targetUser.save();

    const safeUser = targetUser.toObject();
    delete safeUser.passwordHash;

    try {
      const actorId = req.user?.userId || req.user?.id;
      const actorName = req.user?.firstName || req.user?.username || (userRole === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้จัดการ');
      await TeamActivity.create({
        teamId: targetUser.teamId || null,
        actor: actorId || null,
        actionType: 'USER_UPDATED',
        title: `${actorName} กำหนดตำแหน่งของ ${safeUser.username} เป็น ${position}`,
        details: `ผู้ใช้: ${safeUser.username} (${safeUser.email}) ตำแหน่งใหม่: ${position}`,
        entityId: safeUser._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', { teamId: targetUser.teamId });
    } catch (logErr) {
      console.warn('Logging updateUserPosition failed:', logErr.message);
    }

    notifyUserUpdated(safeUser);
    broadcast('USER_UPDATED', { user: safeUser });

    res.status(200).json({ message: 'User position updated successfully', user: safeUser });
  } catch (error) {
    console.error('updateUserPosition error:', error);
    res.status(500).json({ message: 'Server error updating user position', error: error.message });
  }
};

// @route DELETE /api/users/:id
// @access Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      const actorId = req.user?.userId || req.user?.id;
      const actorName = req.user?.firstName || req.user?.username || 'ผู้ดูแลระบบ';
      await TeamActivity.create({
        teamId: null,
        actor: actorId || null,
        actionType: 'USER_DELETED',
        title: `${actorName} ลบผู้ใช้งาน ${user.username} ออกจากระบบ`,
        details: `อีเมล: ${user.email}`,
        entityId: user._id,
        entityModel: 'User',
      });
      broadcast('ACTIVITY_CREATED', {});
    } catch (logErr) {
      console.warn('Logging deleteUser failed:', logErr.message);
    }

    broadcast('USER_DELETED', { userId: String(id) });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @route PATCH /api/users/profile
// @access Private (Logged-in user)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { firstName, lastName, name } = req.body;

    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (name && !firstName) {
      const parts = name.trim().split(' ');
      updateFields.firstName = parts[0];
      updateFields.lastName = parts.slice(1).join(' ') || '';
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    notifyUserUpdated(updatedUser);

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getOnlineUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserPosition,
  deleteUser,
  updateProfile,
};

