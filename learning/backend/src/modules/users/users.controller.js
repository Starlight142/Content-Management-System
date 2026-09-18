const User = require('../../database/models/User');

// @desc    สร้างผู้ใช้ใหม่
// @route   POST /api/users
// @access  Public (ในเฟสเริ่มต้น)
const createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'สร้างผู้ใช้สำเร็จ!',
            data: newUser,
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message,
        });
    }
};

// @desc    ดึงรายชื่อผู้ใช้ทั้งหมด
// @route   GET /api/users
// @access  Public (ในเฟสเริ่มต้น)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            total: users.length,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
};

