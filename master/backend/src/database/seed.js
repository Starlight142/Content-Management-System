const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Content = require('./models/Content');
const Task = require('./models/Task');
const Idea = require('./models/Idea');
const Team = require('./models/Team');
const LegalArticle = require('./models/LegalArticle');
const TeamActivity = require('./models/TeamActivity');

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
    await TeamActivity.deleteMany({});
    console.log('🧹 Cleaned existing database collections');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    // 1. Seed Users
    const adminUser = await User.create({
      username: 'somchai_admin',
      email: 'admin@studio.com',
      passwordHash,
      firstName: 'สมชาย',
      lastName: 'ดูแลระบบ',
      role: 'ADMIN',
      status: 'ACTIVE',
      workingStatus: 'WORKING',
    });

    const managerUser = await User.create({
      username: 'somsri_manager',
      email: 'manager@studio.com',
      passwordHash,
      firstName: 'สมศรี',
      lastName: 'จัดการทีม',
      role: 'MANAGER',
      status: 'ACTIVE',
      workingStatus: 'WORKING',
    });

    const johnMember = await User.create({
      username: 'john_creator',
      email: 'member@studio.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Editor',
      role: 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'WORKING',
    });

    const janeMember = await User.create({
      username: 'jane_script',
      email: 'jane@studio.com',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Script',
      role: 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'REVIEWING',
    });

    const mikeMember = await User.create({
      username: 'mike_graphic',
      email: 'mike@studio.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Graphic',
      role: 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'WORKING',
    });

    const outsiderMember = await User.create({
      username: 'outsider_user',
      email: 'outsider@studio.com',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Outsider',
      role: 'MEMBER',
      status: 'ACTIVE',
      workingStatus: 'IDLE',
    });

    console.log('✅ Created Users: Admin, Manager, John, Jane, Mike, Outsider');

    // 2. Seed Teams
    const teamA = await Team.create({
      name: 'Content Team A',
      description: 'ทีมผลิต Content หลักประจำปี 2026 สำหรับ TikTok & YouTube',
      members: [
        { user: managerUser._id, roleInTeam: 'LEAD' },
        { user: johnMember._id, roleInTeam: 'EDITOR' },
        { user: janeMember._id, roleInTeam: 'CREATOR' },
        { user: mikeMember._id, roleInTeam: 'DESIGNER' },
      ],
    });

    const teamB = await Team.create({
      name: 'Content Team B (Beta Studio)',
      description: 'ทีมสำรองสำหรับทดสอบการกั้นสิทธิ์ความปลอดภัยข้ามทีม',
      members: [
        { user: adminUser._id, roleInTeam: 'LEAD' },
        { user: outsiderMember._id, roleInTeam: 'MEMBER' },
      ],
    });

    // Update users' primary teamId
    await User.updateMany({ _id: { $in: [managerUser._id, johnMember._id, janeMember._id, mikeMember._id] } }, { teamId: teamA._id });
    await User.updateMany({ _id: { $in: [outsiderMember._id] } }, { teamId: teamB._id });

    console.log('✅ Created Teams: Content Team A and Team B');

    // 3. Seed Ideas
    const idea1 = await Idea.create({
      title: 'รีวิวเปรียบเทียบ AI Video Generator 2026',
      description: 'ทดสอบตัดต่อคลิปด้วย AI 5 ตัวเทียบความคมชัด ความเร็ว และการพากย์เสียงภาษาไทย',
      category: 'Tech Review',
      platform: 'YouTube',
      proposedBy: johnMember._id,
      status: 'APPROVED',
      upvotes: 18,
    });

    const idea2 = await Idea.create({
      title: 'สรุปข่าวเทคโนโลยีประจำวันใน 1 นาที',
      description: 'คลิปสั้นเจาะลึกฟีเจอร์ AI ใหม่ล่าสุดประจำวันสำหรับคนไม่มีเวลาอ่านข่าว',
      category: 'News & Tech',
      platform: 'TikTok',
      proposedBy: janeMember._id,
      status: 'APPROVED',
      upvotes: 24,
    });

    const idea3 = await Idea.create({
      title: 'แจกพิกัดอุปกรณ์จัดโต๊ะคอม Minimal สำหรับ Live',
      description: 'Content สไตล์ Minimal แนะนำการจัดแสงและไมโครโฟนไร้สาย',
      category: 'Lifestyle',
      platform: 'Instagram',
      proposedBy: mikeMember._id,
      status: 'DRAFT',
      upvotes: 9,
    });

    console.log('✅ Created 3 Ideas');

    // 4. Seed Contents for Team A
    const content1 = await Content.create({
      title: 'AI Tutorial EP.01',
      description: 'เจาะลึกการใช้ AI ช่วย Generate Prompt และสร้าง Storyboard ฉบับสมบูรณ์',
      platform: 'TikTok',
      status: 'PRODUCTION',
      category: 'Education',
      progress: 70,
      teamId: teamA._id,
      createdBy: johnMember._id,
      ideaId: idea1._id,
      dueDate: new Date('2026-09-26'),
      metrics: [
        { views: 45200, likes: 6200, comments: 480, shares: 1250, engagementRate: 17.5 },
      ],
      legalChecklist: [
        { ruleTitle: 'ตรวจสอบลิขสิทธิ์เพลงและเสียงประกอบ', passed: true, note: 'ใช้เพลงลิขสิทธิ์สตูดิโอ' },
        { ruleTitle: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ', passed: true, note: 'ภาพถ่ายทำและเรนเดอร์เอง' },
        { ruleTitle: 'ตรวจสอบความเหมาะสมของเนื้อหา', passed: true, note: 'เนื้อหาผ่านเกณฑ์ชุมชน' },
      ],
    });

    const content2 = await Content.create({
      title: 'Product Review 8K Camera',
      description: 'รีวิวอุปกรณ์สตูดิโอ 8K ไมโครโฟนและไฟสตูดิโอแบบพกพา',
      platform: 'YouTube',
      status: 'REVIEW',
      category: 'Tech Review',
      progress: 85,
      teamId: teamA._id,
      createdBy: janeMember._id,
      dueDate: new Date('2026-09-24'),
      metrics: [
        { views: 18400, likes: 2100, comments: 195, shares: 320, engagementRate: 14.2 },
      ],
      legalChecklist: [
        { ruleTitle: 'ตรวจสอบลิขสิทธิ์เพลงและเสียงประกอบ', passed: true, note: 'ใบอนุญาต Epidemic Sound' },
        { ruleTitle: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ', passed: true, note: 'ภาพถ่ายจากสตูดิโอจริง' },
        { ruleTitle: 'ตรวจสอบความเหมาะสมของเนื้อหา', passed: true, note: 'ระบุผู้สนับสนุนครบถ้วน' },
      ],
    });

    const content3 = await Content.create({
      title: 'Thumbnail Campaign',
      description: 'ชุดภาพปกและแคมเปญโปรโมตสื่อประจำสัปดาห์บน Instagram',
      platform: 'Instagram',
      status: 'PRODUCTION',
      category: 'Design',
      progress: 30,
      teamId: teamA._id,
      createdBy: mikeMember._id,
      dueDate: new Date('2026-09-28'),
    });

    const content4 = await Content.create({
      title: 'Tech News Daily Recap',
      description: 'คลิปสรุปข่าว AI ประจำวันใน 60 วินาที เน้นความกระชับและเสียงพากย์คมชัด',
      platform: 'TikTok',
      status: 'REVISION',
      category: 'News & Tech',
      progress: 60,
      teamId: teamA._id,
      createdBy: johnMember._id,
      dueDate: new Date('2026-09-24'),
      reviewHistory: [
        {
          reviewerId: managerUser._id,
          decision: 'REVISION',
          notes: 'นาทีที่ 0:35 เสียงเพลงกลบเสียงพูด และมีคำผิดใน Subtitle ท้ายคลิป ช่วยแก้แล้วส่งตรวจใหม่ด้วยครับ',
          reviewedAt: new Date(Date.now() - 40 * 60 * 1000),
        },
      ],
    });

    const content5 = await Content.create({
      title: 'Desk Setup Minimalist Guide',
      description: 'วิดีโอแนะนำอุปกรณ์จัดโต๊ะทำงานสไตล์ Minimalist แสงธรรมชาติ',
      platform: 'YouTube',
      status: 'APPROVED',
      category: 'Lifestyle',
      progress: 100,
      teamId: teamA._id,
      createdBy: mikeMember._id,
      dueDate: new Date('2026-09-22'),
      reviewHistory: [
        {
          reviewerId: managerUser._id,
          decision: 'APPROVED',
          notes: 'งานตัดต่อและเกรดสีผ่านเกณฑ์เรียบร้อย พร้อมสำหรับขั้นตอนการเผยแพร่',
          reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ],
    });

    const content6 = await Content.create({
      title: 'AI Voice Cloning Behind-The-Scenes',
      description: 'เบื้องหลังการพากย์เสียงจำลองสำหรับวิดีโอสตูดิโอ',
      platform: 'YouTube',
      status: 'PLANNING',
      category: 'Technology',
      progress: 10,
      teamId: teamA._id,
      createdBy: janeMember._id,
      dueDate: new Date('2026-09-30'),
    });

    console.log('✅ Created 6 Contents for Content Team A (Production, Review, Revision, Approved, Planning)');

    // 5. Seed Tasks for Team A (10 Tasks across John, Jane, Mike)
    const task1 = await Task.create({
      title: 'ตัดต่อแก้ไขคลิปและปรับแต่งเสียง (Tech News Recap)',
      contentId: content4._id,
      teamId: teamA._id,
      taskType: 'Editing',
      assignedTo: johnMember._id,
      status: 'REVISION',
      progress: 60,
      dueDate: new Date('2026-09-24'),
      submissionUrl: 'https://drive.google.com/file/d/tech_news_recap_v1_draft',
      notes: 'นาทีที่ 0:35 เสียงเพลงกลบเสียงพูด และมีคำผิดใน Subtitle ท้ายคลิป ช่วยแก้แล้วส่งตรวจใหม่ด้วยครับ',
      revisionNotes: 'นาทีที่ 0:35 เสียงเพลงกลบเสียงพูด และมีคำผิดใน Subtitle ท้ายคลิป ช่วยแก้แล้วส่งตรวจใหม่ด้วยครับ',
    });

    const task2 = await Task.create({
      title: 'ตัดต่อวิดีโอ (Highlight & Sound FX)',
      contentId: content1._id,
      teamId: teamA._id,
      taskType: 'Editing',
      assignedTo: johnMember._id,
      status: 'IN_PROGRESS',
      progress: 70,
      dueDate: new Date('2026-09-26'),
      submissionUrl: '',
      notes: 'กำลังใส่ Sound FX และ Subtitle ส่วนท้ายคลิป',
    });

    const task3 = await Task.create({
      title: 'Export วิดีโอ Master 4K Color Graded',
      contentId: content2._id,
      teamId: teamA._id,
      taskType: 'Editing',
      assignedTo: johnMember._id,
      status: 'REVIEW',
      progress: 85,
      dueDate: new Date('2026-09-25'),
      submissionUrl: 'https://frame.io/player/product_review_master_4k',
      notes: 'ปรับ Color Grading และ Render 4K เสร็จแล้ว ส่งให้ Manager ตรวจสอบ',
    });

    const task4 = await Task.create({
      title: 'คัดเลือกฟุตเทจ B-Roll สำหรับคลิปเสียงพากย์ AI',
      contentId: content6._id,
      teamId: teamA._id,
      taskType: 'Editing',
      assignedTo: johnMember._id,
      status: 'TODO',
      progress: 0,
      dueDate: new Date('2026-09-29'),
      submissionUrl: '',
      notes: 'รอดำเนินการหลังจากสคริปต์เสร็จสมบูรณ์',
    });

    const task5 = await Task.create({
      title: 'Export Teaser สรุปอุปกรณ์จัดโต๊ะ 30 วินาที',
      contentId: content5._id,
      teamId: teamA._id,
      taskType: 'Editing',
      assignedTo: johnMember._id,
      status: 'DONE',
      progress: 100,
      dueDate: new Date('2026-09-22'),
      submissionUrl: 'https://drive.google.com/file/d/desk_setup_teaser_final',
      notes: 'ผ่านการอนุมัติเรียบร้อย',
    });

    const task6 = await Task.create({
      title: 'เขียนบทและตรวจทานสคริปต์ (Script Product Review v2)',
      contentId: content2._id,
      teamId: teamA._id,
      taskType: 'Scripting',
      assignedTo: janeMember._id,
      status: 'REVIEW',
      progress: 85,
      dueDate: new Date('2026-09-24'),
      submissionUrl: 'https://docs.google.com/document/d/script_product_review_v2',
      notes: 'ปรับแก้บทสนทนาและจุดเน้นสปอนเซอร์เรียบร้อยแล้ว ส่งให้ Manager ตรวจสอบ',
    });

    const task7 = await Task.create({
      title: 'ร่างสคริปต์สัมภาษณ์ AI Tutorial EP.02',
      contentId: content1._id,
      teamId: teamA._id,
      taskType: 'Scripting',
      assignedTo: janeMember._id,
      status: 'IN_PROGRESS',
      progress: 40,
      dueDate: new Date('2026-09-27'),
      submissionUrl: '',
      notes: 'กำลังสรุปประเด็นคำถามหลัก 5 ข้อ',
    });

    const task8 = await Task.create({
      title: 'ออกแบบภาพปกและแบนเนอร์ (Thumbnail Campaign)',
      contentId: content3._id,
      teamId: teamA._id,
      taskType: 'Graphic Design',
      assignedTo: mikeMember._id,
      status: 'IN_PROGRESS',
      progress: 30,
      dueDate: new Date('2026-09-28'),
      submissionUrl: '',
      notes: 'กำลังขึ้นโครงร่าง Layout มินิมอล 3 รูปแบบ',
    });

    const task9 = await Task.create({
      title: 'จัดทำ Infographic กราฟิกสถิติ Tech News Recap',
      contentId: content4._id,
      teamId: teamA._id,
      taskType: 'Graphic Design',
      assignedTo: mikeMember._id,
      status: 'TODO',
      progress: 0,
      dueDate: new Date('2026-09-25'),
      submissionUrl: '',
      notes: 'เตรียมแผนภูมิเปรียบเทียบ AI Models',
    });

    const task10 = await Task.create({
      title: 'ออกแบบ Cover Art Desk Setup Minimalist',
      contentId: content5._id,
      teamId: teamA._id,
      taskType: 'Graphic Design',
      assignedTo: mikeMember._id,
      status: 'DONE',
      progress: 100,
      dueDate: new Date('2026-09-22'),
      submissionUrl: 'https://drive.google.com/file/d/cover_desk_setup_final',
      notes: 'อัปโหลดภาพขนาด 1920x1080 ผ่านเกณฑ์',
    });

    console.log('✅ Created 10 Tasks across John (5), Jane (2), Mike (3)');

    // 6. Seed Team Activities for Team A
    await TeamActivity.create([
      {
        teamId: teamA._id,
        actor: managerUser._id,
        actionType: 'CONTENT_REVISED',
        title: 'Manager ส่ง Tech News Daily Recap กลับไปแก้ไข',
        details: 'นาทีที่ 0:35 เสียงเพลงกลบเสียงพูด และมีคำผิดใน Subtitle ท้ายคลิป',
        entityId: content4._id,
        entityModel: 'Content',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 นาทีที่แล้ว
      },
      {
        teamId: teamA._id,
        actor: johnMember._id,
        actionType: 'TASK_SUBMITTED',
        title: 'John ส่ง Master 4K ของ Product Review ให้ตรวจ',
        details: 'ลิงก์: https://frame.io/player/product_review_master_4k',
        entityId: task3._id,
        entityModel: 'Task',
        createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 นาทีที่แล้ว
      },
      {
        teamId: teamA._id,
        actor: janeMember._id,
        actionType: 'TASK_SUBMITTED',
        title: 'Jane อัปโหลด Script v2 ของ Product Review',
        details: 'แนบลิงก์ Google Docs สคริปต์ฉบับปรับแก้',
        entityId: task6._id,
        entityModel: 'Task',
        createdAt: new Date(Date.now() - 55 * 60 * 1000), // 55 นาทีที่แล้ว
      },
      {
        teamId: teamA._id,
        actor: managerUser._id,
        actionType: 'CONTENT_APPROVED',
        title: 'Manager อนุมัติคอนเทนต์ "Desk Setup Minimalist Guide" เรียบร้อยแล้ว',
        details: 'งานตัดต่อและเกรดสีผ่านเกณฑ์สมบูรณ์',
        entityId: content5._id,
        entityModel: 'Content',
        createdAt: new Date(Date.now() - 80 * 60 * 1000), // 80 นาทีที่แล้ว
      },
      {
        teamId: teamA._id,
        actor: managerUser._id,
        actionType: 'TASK_ASSIGNED',
        title: 'Manager มอบหมาย Thumbnail ให้ Mike',
        details: 'กำหนดส่งวันที่ 28 ก.ย. สไตล์ Minimal Clean',
        entityId: task8._id,
        entityModel: 'Task',
        createdAt: new Date(Date.now() - 120 * 60 * 1000), // 2 ชั่วโมงที่แล้ว
      },
      {
        teamId: teamA._id,
        actor: mikeMember._id,
        actionType: 'TASK_STATUS_CHANGED',
        title: 'Mike เริ่มทำงาน Thumbnail Campaign',
        details: 'ความคืบหน้า 30%',
        entityId: task8._id,
        entityModel: 'Task',
        createdAt: new Date(Date.now() - 140 * 60 * 1000),
      },
    ]);

    console.log('✅ Created 6 Team Activities for Team A');

    // 7. Seed Legal Articles
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
    ]);
    console.log('✅ Created 3 Legal Articles');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('🔑 บัญชีทดสอบระบบ (รหัสผ่านคือ 123456 ทั้งหมด):');
    console.log('👑 Admin:             admin@studio.com');
    console.log('👔 Manager (Somsri):   manager@studio.com');
    console.log('🎬 Member (John - Ed): member@studio.com');
    console.log('📝 Member (Jane - Sc): jane@studio.com');
    console.log('🎨 Member (Mike - Gr): mike@studio.com');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
