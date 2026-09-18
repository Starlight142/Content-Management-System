require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

// ดึง Route Modules
const usersRoutes = require('./modules/users/users.routes');

const app = express();

// 1. เชื่อมต่อฐานข้อมูล MongoDB
connectDB();

// 2. Global Middleware
app.use(express.json());

// 3. Health Check & Root Route
app.get('/', (req, res) => {
    res.send('🚀 Content Production Management System API is running');
});

// 4. Feature Modules (โครงสร้างเดียวกับ master)
app.use('/api/users', usersRoutes);

// 5. เปิดพอร์ตและเริ่มรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});