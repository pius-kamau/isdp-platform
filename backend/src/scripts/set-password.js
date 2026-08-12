const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setPassword() {
  try {
    const email = 'piusmwangi611@gmail.com';
    const password = 'Test@1234';
    
    console.log('Setting password for:', email);
    
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
