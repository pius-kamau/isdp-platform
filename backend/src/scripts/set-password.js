const { PrismaClient } = require('@prisma/client');

// Use the Render database URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const bcrypt = require('bcryptjs');

async function setPassword() {
  try {
    const email = 'piusmwangi611@gmail.com';
    const password = 'Test@1234';
    
    console.log('Setting password for:', email);
    console.log('Using database:', process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is NOT set');
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!existingUser) {
      console.log('User not found in database');
      console.log('Available users:');
      const users = await prisma.user.findMany({
        select: { email: true, fullName: true }
      });
      console.log(users);
      process.exit(1);
    }
    
    console.log('User found:', existingUser.id);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.update({
      where: { email },
      data: { 
        passwordHash: hashedPassword
      }
    });
    
    console.log('✅ Password set successfully for:', user.email);
    console.log('User ID:', user.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setPassword();
