const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Content = require('./models/Content');
const Task = require('./models/Task');
const Idea = require('./models/Idea');
const Team = require('./models/Team');
const LegalArticle = require('./models/LegalArticle');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Content.deleteMany({});
    await Task.deleteMany({});
    await Idea.deleteMany({});
    await Team.deleteMany({});
    await LegalArticle.deleteMany({});
    console.log('🧹 Cleaned existing database collections');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    const adminUser = await User.create({
      username: 'somchai_admin',
      email: 'admin@studio.com',
      passwordHash,
      firstName: 'สมชาย',
      lastName: 'ดูแลระบบ',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const managerUser = await User.create({
      username: 'somsri_manager',
      email: 'manager@studio.com',
      passwordHash,
      firstName: 'สมศรี',
      lastName: 'จัดการทีม',
      role: 'MANAGER',
      status: 'ACTIVE',
    });

    const memberUser1 = await User.create({
      username: 'john_creator',
      email: 'member@studio.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Creator',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const memberUser2 = await User.create({
      username: 'jane_editor',
      email: 'jane@studio.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Editor',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    console.log('✅ Created 4 Users (admin, manager, 2 members)');

    // 2. Seed Team
    const team = await Team.create({
      name: 'Alpha Video Production',
      description: 'ทีมผลิต Content หลักประจำปี 2026 สำหรับ TikTok & YouTube',
      members: [
        { user: managerUser._id, roleInTeam: 'LEAD' },
        { user: memberUser1._id, roleInTeam: 'CREATOR' },
        { user: memberUser2._id, roleInTeam: 'EDITOR' },
      ],
    });
    console.log('✅ Created Team: Alpha Video Production');

    // 3. Seed Ideas
    const idea1 = await Idea.create({
      title: 'รีวิวเปรียบเทียบ AI Video Generator 2026',
      description: 'ทดสอบ 5 AI Tool สำหรับตัดต่อคลิปสั้นลง TikTok',
      category: 'Tech Review',
      proposedBy: memberUser1._id,
      status: 'APPROVED',
    });

    const idea2 = await Idea.create({
      title: 'สรุปข่าวเทคโนโลยีประจำวันใน 1 นาที',
      description: 'คอนเทนต์ความรู้ฉับไว สำหรับคนไม่มีเวลาอ่านข่าว',
      category: 'News',
      proposedBy: memberUser2._id,
      status: 'APPROVED',
    });
    console.log('✅ Created 2 Ideas');

    // 4. Seed Contents
    const content1 = await Content.create({
      title: 'รีวิวแก็ดเจ็ตใหม่ 2026',
      description: 'อุปกรณ์ Smart Home ที่ควรมีติดบ้านปี 2026',
      platform: 'YouTube',
      status: 'PUBLISHED',
      category: 'Tech Review',
      createdBy: managerUser._id,
      ideaId: idea1._id,
      dueDate: new Date('2026-09-25'),
      metrics: [
        { views: 24500, likes: 3200, comments: 410, shares: 190, engagementRate: 15.5 }
      ]
    });

    const content2 = await Content.create({
      title: 'สรุปข่าว AI ภายใน 1 นาที',
      description: 'คลิปสั้นเจาะลึกฟีเจอร์ใหม่',
      platform: 'TikTok',
      status: 'REVIEW',
      category: 'News',
      createdBy: memberUser1._id,
      ideaId: idea2._id,
      dueDate: new Date('2026-09-20'),
      metrics: [
        { views: 88000, likes: 12400, comments: 950, shares: 3100, engagementRate: 18.7 }
      ]
    });
    console.log('✅ Created 2 Contents');

    // 5. Seed Tasks
    await Task.create({
      title: 'ตัดต่อวิดีโอ (Highlight & Sound FX)',
      contentId: content2._id,
      taskType: 'Editing',
      assignedTo: memberUser2._id,
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-09-18'),
      submissionUrl: '',
    });

    await Task.create({
      title: 'บันทึกเสียง Voiceover',
      contentId: content1._id,
      taskType: 'Filming',
      assignedTo: memberUser1._id,
      status: 'DONE',
      dueDate: new Date('2026-09-16'),
      submissionUrl: 'https://drive.google.com/sample_voiceover.wav',
    });
    console.log('✅ Created 2 Tasks');

    // 6. Seed Legal Articles
    await LegalArticle.create([
      {
        title: 'ลิขสิทธิ์เพลงประกอบเชิงพาณิชย์ (Commercial Music License)',
        category: 'Music & Audio',
        description: 'ข้อกำหนดการใช้เพลงในวิดีโอที่มีสปอนเซอร์',
        content: 'ต้องใช้เพลงที่ได้รับอนุญาตแบบ Commercial License จากแหล่งที่ถูกกฎหมาย เช่น Artlist หรือ Epidemic Sound ห้ามนำเพลงติดลิขสิทธิ์ส่วนบุคคลมาใช้',
        source: 'พ.ร.บ. ลิขสิทธิ์ พ.ศ. 2537 และฉบับแก้ไขเพิ่มเติม',
      },
      {
        title: 'แนวปฏิบัติการเบลอหน้าบุคคลภายนอก (PDPA)',
        category: 'PDPA',
        description: 'การถ่ายทำในสถานที่สาธารณะ',
        content: 'หากถ่ายติดบุคคลภายนอกที่ไม่ใช่บุคคลสาธารณะโดยไม่ได้รับความยินยอม ต้องทำการเบลอใบหน้าหรือตัดทอนออกเพื่อป้องกันการละเมิดข้อมูลส่วนบุคคล',
        source: 'พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
      },
      {
        title: 'การระบุข้อความโฆษณาและคำเตือนสินค้า',
        category: 'Advertising',
        description: 'สินค้าประเภทอาหารเสริม ยา และเครื่องสำอาง',
        content: 'ต้องระบุข้อความว่า Sponsored หรือ ได้รับการสนับสนุนอย่างชัดเจน ห้ามโฆษณาเกินจริง และต้องผ่านการรับรองจาก อย. / สคบ.',
        source: 'พ.ร.บ. คุ้มครองผู้บริโภค',
      },
      {
        title: 'กฎชุมชนและระเบียบแพลตฟอร์ม TikTok',
        category: 'Platform Rules',
        description: 'ข้อห้ามและข้อควรระวังในคลิปสั้น',
        content: 'ห้ามแสดงเนื้อหาความรุนแรง การคุกคาม และพฤติกรรมเสี่ยงอันตรายโดยไม่มีคำเตือน',
        source: 'TikTok Community Guidelines 2026',
      },
    ]);
    console.log('✅ Created 4 Legal Articles');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('🔑 Login Credentials (รหัสผ่านคือ 123456 ทั้งหมด):');
    console.log('👑 Admin:   admin@studio.com');
    console.log('👔 Manager: manager@studio.com');
    console.log('🎬 Member:  member@studio.com');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

