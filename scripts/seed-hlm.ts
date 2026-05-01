// Seed HomeLife Media tenant: org + 10 divisions + backfill existing @homelifemedia.com users.
// Idempotent — safe to re-run.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DIVISIONS = [
  { slug: 'product',      name: 'Product',      color: '#6366F1', emoji: '🧩' },
  { slug: 'social',       name: 'Social',       color: '#EC4899', emoji: '📱' },
  { slug: 'publishing',   name: 'Publishing',   color: '#F59E0B', emoji: '📰' },
  { slug: 'advertising',  name: 'Advertising',  color: '#EF4444', emoji: '📣' },
  { slug: 'accounting',   name: 'Accounting',   color: '#10B981', emoji: '💰' },
  { slug: 'marketing',    name: 'Marketing',    color: '#D946EF', emoji: '🎯' },
  { slug: 'hero-support', name: 'Hero Support', color: '#0EA5E9', emoji: '🦸' },
  { slug: 'warehouse',    name: 'Warehouse',    color: '#F97316', emoji: '📦' },
  { slug: 'it',           name: 'IT',           color: '#06B6D4', emoji: '💻' },
  { slug: 'hq',           name: 'HQ',           color: '#64748B', emoji: '⚙️' },
];

async function main() {
  const hlm = await prisma.organization.upsert({
    where: { slug: 'hlm' },
    create: {
      slug: 'hlm',
      name: 'HomeLife Media',
      domains: ['homelifemedia.com'],
      autoGrantAll: true,
      primaryColor: '#0F172A',
    },
    update: {
      name: 'HomeLife Media',
      domains: ['homelifemedia.com'],
      autoGrantAll: true,
      primaryColor: '#0F172A',
    },
  });
  console.log(`✓ HLM org: ${hlm.id}`);

  for (const d of DIVISIONS) {
    const div = await prisma.orgDivision.upsert({
      where: { orgId_slug: { orgId: hlm.id, slug: d.slug } },
      create: { orgId: hlm.id, ...d },
      update: { name: d.name, color: d.color, emoji: d.emoji },
    });
    console.log(`  ✓ division: ${div.emoji} ${div.name}`);
  }

  // Backfill existing @homelifemedia.com users
  const backfilled = await prisma.user.updateMany({
    where: { email: { endsWith: '@homelifemedia.com' }, orgId: null },
    data: { orgId: hlm.id, orgRole: 'learner' },
  });
  console.log(`✓ backfilled ${backfilled.count} existing HLM user(s)`);

  // Marshall = owner
  const marshall = await prisma.user.findUnique({
    where: { email: 'marshall@homelifemedia.com' },
  });
  if (marshall) {
    await prisma.user.update({
      where: { id: marshall.id },
      data: { orgId: hlm.id, orgRole: 'owner' },
    });
    console.log(`✓ marshall@homelifemedia.com → owner`);
  } else {
    console.log(`! no marshall@homelifemedia.com user yet — will become owner on first sign-up`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async err => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
