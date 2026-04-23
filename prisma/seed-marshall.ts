import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  const email = 'marshall@homelifemedia.com';
  const password = 'TruosAdmin-2026!';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    create: { email, name: 'Marshall Morris', passwordHash },
    update: { passwordHash },
  });
  console.log('Admin account ready:');
  console.log('  email:   ', email);
  console.log('  password:', password);
  await prisma.$disconnect();
}
main();
