const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cms_database';
        const conn = await mongoose.connect(mongoUri);
        console.log(`Connected to MongoDB successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;