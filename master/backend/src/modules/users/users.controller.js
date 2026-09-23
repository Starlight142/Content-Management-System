const bcrypt = require('bcryptjs');
const User = require('../../database/models/User');
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
    const { name, username, email, role, password } = req.body;

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
      role: role || 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'IDLE',
      isOnline: false,
      lastActiveAt: new Date(),
    });

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;

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

    notifyUserUpdated(user);

    res.status(200).json({ message: 'Role updated successfully', user });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
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

    broadcast('USER_DELETED', { userId: String(id) });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  getOnlineUsers,
  getUserById,
  createUser,
  updateUserRole,
  deleteUser,
};
