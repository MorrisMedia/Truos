import { PrismaClient } from '@prisma/client';
async function main() {
  const prisma = new PrismaClient();
  const qa = await prisma.user.findUnique({ where: { email: 'qa+all@truos.ai' } });
  if (!qa) { console.log('no qa user'); return; }
  console.log('qa+all user id:', qa.id);
  const rows = await prisma.lessonProgress.findMany({ where: { userId: qa.id }, orderBy: { completedAt: 'desc' }, take: 10 });
  console.log(`${rows.length} progress rows for qa+all:`);
  rows.forEach(r => console.log(` - course ${r.courseId}, m${r.moduleIdx}/l${r.lessonIdx}, score=${r.score}, ${r.completedAt.toISOString()}`));
  const allCount = await prisma.lessonProgress.count();
  console.log('Total progress rows in DB:', allCount);
  await prisma.$disconnect();
}
main();
