const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MANAGER', 'MEMBER'],
        default: 'MEMBER',
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'OFFLINE', 'SUSPENDED'],
        default: 'ACTIVE',
    },
}, {
    timestamps: true, // สร้าง createdAt และ updatedAt ให้อัตโนมัติ
});

module.exports = mongoose.model('User', userSchema); //3. หัวใจสำคัญ: ส่งออก Model