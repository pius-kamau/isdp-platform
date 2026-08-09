const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ========================================
  // 1. Create Skills
  // ========================================

  console.log('🛠️ Creating skills...');

  const skillData = [
    { name: 'Carpentry', category: 'Trades & Handicrafts', description: 'Woodworking, furniture making, and joinery' },
    { name: 'Plumbing', category: 'Trades & Handicrafts', description: 'Pipe installation, repair, and maintenance' },
    { name: 'Electrician', category: 'Trades & Handicrafts', description: 'Electrical wiring, installation, and repair' },
    { name: 'Web Development', category: 'Technology', description: 'Building websites and web applications' },
    { name: 'Mobile Development', category: 'Technology', description: 'Building Android and iOS apps' },
    { name: 'Database Management', category: 'Technology', description: 'Database design, administration, and optimization' },
    { name: 'Farming', category: 'Agriculture', description: 'Crop cultivation and farm management' },
    { name: 'Poultry Farming', category: 'Agriculture', description: 'Chicken rearing and egg production' },
    { name: 'Organic Farming', category: 'Agriculture', description: 'Chemical-free farming methods' },
    { name: 'Teaching', category: 'Education', description: 'Mathematics, science, and general education' },
    { name: 'Nursing', category: 'Healthcare', description: 'Patient care and health services' },
    { name: 'Graphic Design', category: 'Creative Arts', description: 'Digital art, branding, and visual communication' },
    { name: 'Photography', category: 'Creative Arts', description: 'Portrait, event, and commercial photography' },
    { name: 'Accounting', category: 'Business', description: 'Bookkeeping, financial reporting, and tax' },
    { name: 'Marketing', category: 'Business', description: 'Digital marketing, SEO, and social media' },
    { name: 'Tailoring', category: 'Trades & Handicrafts', description: 'Garment making and fashion design' },
    { name: 'Welding', category: 'Trades & Handicrafts', description: 'Metal fabrication and welding' },
    { name: 'Cooking', category: 'Hospitality', description: 'Food preparation and culinary arts' },
    { name: 'Mechanics', category: 'Trades & Handicrafts', description: 'Auto repair and maintenance' },
  ];

  for (const skill of skillData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        name: skill.name,
        description: skill.description,
        category: skill.category,
      },
    });
  }

  // ========================================
  // 2. Create Demo Users
  // ========================================

  console.log('👤 Creating demo users...');

  const passwordHash = await bcrypt.hash('Demo@1234', 10);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@isdp.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@isdp.com',
      phone: '0712345000',
      passwordHash,
      county: 'Nairobi',
      subCounty: 'CBD',
      bio: 'Platform administrator overseeing ISDP operations',
      occupation: 'System Administrator',
      role: 'admin',
      isVerified: true,
      isActive: true,
      emailVerified: true,
    },
  });

  // Mentor User
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@isdp.com' },
    update: {},
    create: {
      fullName: 'John Mentor',
      email: 'mentor@isdp.com',
      phone: '0712345001',
      passwordHash,
      county: 'Nairobi',
      subCounty: 'Westlands',
      bio: 'Expert carpenter with 15 years of experience. Passionate about teaching and mentoring youth.',
      occupation: 'Master Carpenter',
      role: 'mentor',
      isVerified: true,
      isMentor: true,
      isActive: true,
      emailVerified: true,
    },
  });

  // Normal User 1 - Farmer
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@isdp.com' },
    update: {},
    create: {
      fullName: 'Grace Farmer',
      email: 'user1@isdp.com',
      phone: '0712345002',
      passwordHash,
      county: 'Kiambu',
      subCounty: 'Ruiru',
      bio: 'Organic farmer specializing in sustainable agriculture and crop rotation.',
      occupation: 'Organic Farmer',
      role: 'user',
      isVerified: true,
      isActive: true,
      emailVerified: true,
    },
  });

  // Normal User 2 - Developer
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@isdp.com' },
    update: {},
    create: {
      fullName: 'Peter Developer',
      email: 'user2@isdp.com',
      phone: '0712345003',
      passwordHash,
      county: 'Nairobi',
      subCounty: 'Karen',
      bio: 'Full-stack developer looking to mentor aspiring programmers.',
      occupation: 'Software Developer',
      role: 'user',
      isVerified: true,
      isActive: true,
      emailVerified: true,
    },
  });

  // Normal User 3 - Tailor
  const user3 = await prisma.user.upsert({
    where: { email: 'user3@isdp.com' },
    update: {},
    create: {
      fullName: 'Mary Tailor',
      email: 'user3@isdp.com',
      phone: '0712345004',
      passwordHash,
      county: 'Nairobi',
      subCounty: 'Eastlands',
      bio: 'Professional tailor and fashion designer with 10 years of experience.',
      occupation: 'Master Tailor',
      role: 'user',
      isVerified: true,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Users created:');
  console.log(`  - Admin: admin@isdp.com / Demo@1234`);
  console.log(`  - Mentor: mentor@isdp.com / Demo@1234`);
  console.log(`  - User1: user1@isdp.com / Demo@1234`);
  console.log(`  - User2: user2@isdp.com / Demo@1234`);
  console.log(`  - User3: user3@isdp.com / Demo@1234`);

  // ========================================
  // 3. Assign Skills to Users
  // ========================================

  console.log('🛠️ Assigning skills to users...');

  // Get skills
  const skills = await prisma.skill.findMany();

  const skillMap = {};
  for (const skill of skills) {
    skillMap[skill.name] = skill.id;
  }

  // Assign to Mentor (John) - Carpentry & Welding
  if (skillMap['Carpentry']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: mentor.id,
          skillId: skillMap['Carpentry'],
        },
      },
      update: {
        proficiencyLevel: 'expert',
        yearsExperience: 15,
        isMentor: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: mentor.id,
        skillId: skillMap['Carpentry'],
        proficiencyLevel: 'expert',
        yearsExperience: 15,
        isMentor: true,
        verificationStatus: 'verified',
      },
    });
  }

  if (skillMap['Welding']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: mentor.id,
          skillId: skillMap['Welding'],
        },
      },
      update: {
        proficiencyLevel: 'advanced',
        yearsExperience: 8,
        isMentor: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: mentor.id,
        skillId: skillMap['Welding'],
        proficiencyLevel: 'advanced',
        yearsExperience: 8,
        isMentor: true,
        verificationStatus: 'verified',
      },
    });
  }

  // Assign to Grace (Farmer) - Farming & Organic Farming
  if (skillMap['Farming']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user1.id,
          skillId: skillMap['Farming'],
        },
      },
      update: {
        proficiencyLevel: 'expert',
        yearsExperience: 12,
        isMentor: true,
        isVolunteer: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: user1.id,
        skillId: skillMap['Farming'],
        proficiencyLevel: 'expert',
        yearsExperience: 12,
        isMentor: true,
        isVolunteer: true,
        verificationStatus: 'verified',
      },
    });
  }

  if (skillMap['Organic Farming']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user1.id,
          skillId: skillMap['Organic Farming'],
        },
      },
      update: {
        proficiencyLevel: 'expert',
        yearsExperience: 8,
        isMentor: true,
        isVolunteer: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: user1.id,
        skillId: skillMap['Organic Farming'],
        proficiencyLevel: 'expert',
        yearsExperience: 8,
        isMentor: true,
        isVolunteer: true,
        verificationStatus: 'verified',
      },
    });
  }

  // Assign to Peter (Developer) - Web Development & Mobile Development
  if (skillMap['Web Development']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user2.id,
          skillId: skillMap['Web Development'],
        },
      },
      update: {
        proficiencyLevel: 'advanced',
        yearsExperience: 6,
        isMentor: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: user2.id,
        skillId: skillMap['Web Development'],
        proficiencyLevel: 'advanced',
        yearsExperience: 6,
        isMentor: true,
        verificationStatus: 'verified',
      },
    });
  }

  if (skillMap['Mobile Development']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user2.id,
          skillId: skillMap['Mobile Development'],
        },
      },
      update: {
        proficiencyLevel: 'intermediate',
        yearsExperience: 3,
        verificationStatus: 'verified',
      },
      create: {
        userId: user2.id,
        skillId: skillMap['Mobile Development'],
        proficiencyLevel: 'intermediate',
        yearsExperience: 3,
        verificationStatus: 'verified',
      },
    });
  }

  // Assign to Mary (Tailor) - Tailoring
  if (skillMap['Tailoring']) {
    await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: user3.id,
          skillId: skillMap['Tailoring'],
        },
      },
      update: {
        proficiencyLevel: 'expert',
        yearsExperience: 10,
        isMentor: true,
        verificationStatus: 'verified',
      },
      create: {
        userId: user3.id,
        skillId: skillMap['Tailoring'],
        proficiencyLevel: 'expert',
        yearsExperience: 10,
        isMentor: true,
        verificationStatus: 'verified',
      },
    });
  }

  // ========================================
  // 4. Create a Mentorship Request
  // ========================================

  console.log('🤝 Creating mentorship request...');

  const carpentrySkill = await prisma.skill.findFirst({
    where: { name: 'Carpentry' },
  });

  if (carpentrySkill) {
    await prisma.mentorRequest.create({
      data: {
        menteeId: user1.id,
        mentorId: mentor.id,
        skillId: carpentrySkill.id,
        message: 'I would like to learn carpentry to build furniture for my farm. Can you mentor me?',
        status: 'accepted',
        requestedAt: new Date(),
        respondedAt: new Date(),
      },
    });
  }

  // ========================================
  // 5. Create Messages
  // ========================================

  console.log('💬 Creating demo messages...');

  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: mentor.id,
      messageText: 'Hi John! I saw you are a carpentry expert. I need help building a chicken coop for my farm.',
      isRead: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: mentor.id,
      receiverId: user1.id,
      messageText: "Hello Grace! I'd be happy to help. When would you like to start?",
      isRead: false,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Demo Accounts:');
  console.log('   Admin:   admin@isdp.com   / Demo@1234');
  console.log('   Mentor:  mentor@isdp.com  / Demo@1234');
  console.log('   User1:   user1@isdp.com   / Demo@1234');
  console.log('   User2:   user2@isdp.com   / Demo@1234');
  console.log('   User3:   user3@isdp.com   / Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });