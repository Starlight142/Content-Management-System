const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
  return next();
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

const verifyTeamAccess = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }

    const teamId = req.params.teamId || req.params.id || req.body.teamId || req.query.teamId;
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required to verify access' });
    }

    const Team = require('../database/models/Team');
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      (m) => m.user && m.user.toString() === (req.user.userId || req.user.id || '').toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to view or manage this team workspace',
      });
    }

    req.team = team;
    next();
  } catch (error) {
    console.error('verifyTeamAccess error:', error);
    res.status(500).json({ message: 'Server error verifying team authorization' });
  }
};

module.exports = {
  verifyToken,
  verifyRole,
  verifyTeamAccess,
};


