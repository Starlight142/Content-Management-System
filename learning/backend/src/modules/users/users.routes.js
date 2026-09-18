const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');

// เส้นทางย่อยของ /api/users
// POST /api/users -> สร้าง User
router.post('/', usersController.createUser);

// GET /api/users -> ดึงรายชื่อ User ทั้งหมด
router.get('/', usersController.getAllUsers);

module.exports = router;

