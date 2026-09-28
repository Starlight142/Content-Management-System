const TeamActivity = require('../../database/models/TeamActivity');
const { broadcast } = require('../../services/presence.service');

// @route GET /api/logs
// @access Private (Admin/Manager)
const getAllLogs = async (req, res) => {
  try {
    const { search, actionType, limit = 200 } = req.query;

    const query = {};

    if (actionType && actionType !== 'ALL') {
      query.actionType = { $regex: actionType, $options: 'i' };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { details: { $regex: s, $options: 'i' } },
        { actionType: { $regex: s, $options: 'i' } },
      ];
    }

    const activities = await TeamActivity.find(query)
      .populate('actor', 'username email firstName lastName role')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const formatted = activities.map((a) => {
      const actorName = a.actor
        ? `${a.actor.firstName || ''} ${a.actor.lastName || ''}`.trim() || a.actor.username
        : 'ระบบ (System)';

      return {
        _id: a._id,
        id: a._id,
        action: a.actionType,
        user: actorName,
        actorRole: a.actor?.role || 'SYSTEM',
        userEmail: a.actor?.email || '-',
        teamName: a.teamId?.name || 'สตูดิโอส่วนกลาง',
        title: a.title,
        details: a.details || a.title,
        date: a.createdAt ? new Date(a.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '-',
        createdAt: a.createdAt,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('getAllLogs error:', error);
    res.status(500).json({ message: 'Server error retrieving logs', error: error.message });
  }
};

// @route DELETE /api/logs
// @access Private (Admin)
const clearLogs = async (req, res) => {
  try {
    await TeamActivity.deleteMany({});
    broadcast('LOGS_CLEARED', {});
    broadcast('ACTIVITY_CREATED', {});
    res.status(200).json({ message: 'Logs cleared successfully' });
  } catch (error) {
    console.error('clearLogs error:', error);
    res.status(500).json({ message: 'Server error clearing logs', error: error.message });
  }
};

// @route POST /api/logs
// @access Private
const createLog = async (req, res) => {
  try {
    const { actionType, title, details, teamId, entityId, entityModel } = req.body;
    const actorId = req.user?.userId || req.user?.id;

    const newLog = await TeamActivity.create({
      teamId: teamId || null,
      actor: actorId || null,
      actionType: actionType || 'SYSTEM_ACTION',
      title,
      details: details || '',
      entityId: entityId || null,
      entityModel: entityModel || null,
    });

    broadcast('ACTIVITY_CREATED', { activity: newLog });

    res.status(201).json({ message: 'Log created successfully', log: newLog });
  } catch (error) {
    console.error('createLog error:', error);
    res.status(500).json({ message: 'Server error creating log', error: error.message });
  }
};

module.exports = {
  getAllLogs,
  clearLogs,
  createLog,
};
