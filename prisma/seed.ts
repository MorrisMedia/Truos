import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(email: string, name: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name },
  });
}

async function grantAllCourses(userId: string) {
  const allPaid = [101, 102, 103, 104, 201, 202, 203, 204];
  for (const cid of allPaid) {
    await prisma.courseEntitlement.upsert({
      where: { userId_courseId_source: { userId, courseId: cid, source: 'manual_grant' } },
      create: { userId, courseId: cid, source: 'manual_grant' },
      update: {},
    });
  }
}

async function main() {
  const qaAllPassword = process.env.SEED_QA_ALL_PASSWORD || 'TruosQA-All-2026';
  const qaFreePassword = process.env.SEED_QA_FREE_PASSWORD || 'TruosQA-Free-2026';

  const qaAll = await upsertUser('qa+all@truos.ai', 'QA All-Access', qaAllPassword);
  await grantAllCourses(qaAll.id);

  await upsertUser('qa+free@truos.ai', 'QA Free Tier', qaFreePassword);

  // Sample comp code for testing
  await prisma.compCode.upsert({
    where: { code: 'DEMO2026' },
    create: {
      code: 'DEMO2026',
      label: 'Demo code — all paid courses',
      courseIds: [],
      maxUses: 50,
      createdBy: 'seed',
    },
    update: {},
  });

  console.log('SEED COMPLETE');
  console.log('qa+all@truos.ai  password:', qaAllPassword);
  console.log('qa+free@truos.ai password:', qaFreePassword);
  console.log('Staff accounts (via env allowlist): marshall@homelifemedia.com, morris8507@gmail.com');
  console.log('   — staff must sign up via /sign-up with one of these emails; staff mode kicks in automatically');
  console.log('Comp code DEMO2026 active (50 uses, all paid courses).');
}

main().finally(() => prisma.$disconnect());
