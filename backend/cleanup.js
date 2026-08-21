const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // First, check how many users exist
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // Get users to delete (all except admin)
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: { not: 'piusmwangi611@gmail.com' }
      },
      select: { id: true, email: true, fullName: true }
    });
    
    console.log(`📋 Users to delete: ${usersToDelete.length}`);
    usersToDelete.forEach(u => {
      console.log(`  - ${u.email} (${u.fullName})`);
    });

    if (usersToDelete.length === 0) {
      console.log('✅ No users to delete. Only admin exists.');
      return;
    }

    const userIds = usersToDelete.map(u => u.id);
    console.log('🗑️ Deleting related records...');

    // Delete related records in order (child tables first)
    
    // 1. Delete UserSkill
    const deletedUserSkills = await prisma.userSkill.deleteMany({
      where: { userId: { in: userIds } }
    });
    console.log(`  ✅ Deleted ${deletedUserSkills.count} UserSkill records`);

    // 2. Delete Experience
    const deletedExperience = await prisma.experience.deleteMany({
      where: { userId: { in: userIds } }
    });
    console.log(`  ✅ Deleted ${deletedExperience.count} Experience records`);

    // 3. Delete Qualifications
    const deletedQualifications = await prisma.qualification.deleteMany({
      where: { userId: { in: userIds } }
    });
    console.log(`  ✅ Deleted ${deletedQualifications.count} Qualification records`);

    // 4. Delete Volunteering
    const deletedVolunteering = await prisma.volunteering.deleteMany({
      where: { userId: { in: userIds } }
    });
    console.log(`  ✅ Deleted ${deletedVolunteering.count} Volunteering records`);

    // 5. Delete Availability
    const deletedAvailability = await prisma.availability.deleteMany({
      where: { userId: { in: userIds } }
    });
    console.log(`  ✅ Deleted ${deletedAvailability.count} Availability records`);

    // 6. Delete Messages (where user is sender or receiver)
    const deletedMessages = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: { in: userIds } },
          { receiverId: { in: userIds } }
        ]
      }
    });
    console.log(`  ✅ Deleted ${deletedMessages.count} Message records`);

    // 7. Delete Mentorship Requests
    const deletedRequests = await prisma.mentorshipRequest.deleteMany({
      where: {
        OR: [
          { mentorId: { in: userIds } },
          { menteeId: { in: userIds } }
        ]
      }
    });
    console.log(`  ✅ Deleted ${deletedRequests.count} MentorshipRequest records`);

    // 8. Delete Sessions
    const deletedSessions = await prisma.mentorshipSession.deleteMany({
      where: {
        OR: [
          { mentorId: { in: userIds } },
          { menteeId: { in: userIds } }
        ]
      }
    });
    console.log(`  ✅ Deleted ${deletedSessions.count} MentorshipSession records`);

    // 9. Now delete the users
    const deleted = await prisma.user.deleteMany({
      where: {
        email: { not: 'piusmwangi611@gmail.com' }
      }
    });
    
    console.log(`✅ Deleted ${deleted.count} users (kept admin: piusmwangi611@gmail.com)`);

    // Verify only admin remains
    const remaining = await prisma.user.findMany({
      select: { email: true, fullName: true }
    });
    console.log('📋 Remaining users:', remaining.map(u => u.email).join(', '));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
