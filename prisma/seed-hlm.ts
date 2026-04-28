/**
 * Seed script for HomeLife Media org.
 * Run: npx ts-node --project tsconfig.json prisma/seed-hlm.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HomeLife Media org…');

  // Find or create org
  let org = await prisma.organization.findFirst({ where: { name: 'HomeLife Media' } });
  if (!org) {
    org = await prisma.organization.create({ data: { name: 'HomeLife Media' } });
    console.log('Created org:', org.id);
  } else {
    console.log('Found existing org:', org.id);
  }

  const deptNames = [
    'Editorial',
    'Marketing',
    'Advertising',
    'Engineering',
    'Customer Success',
    'Operations',
    'Leadership',
  ];

  const deptRecords: Record<string, string> = {};
  for (const name of deptNames) {
    const d = await prisma.orgDepartment.upsert({
      where: { orgId_name: { orgId: org.id, name } },
      update: {},
      create: { orgId: org.id, name },
    });
    deptRecords[name] = d.id;
    console.log(`Dept "${name}": ${d.id}`);
  }

  // Add Marshall as org_admin
  const marshall = await prisma.user.findUnique({
    where: { email: 'marshall@homelifemedia.com' },
  });

  if (marshall) {
    const seedToken = `seed-marshall-admin-${org.id}`;
    const existing = await prisma.orgMembership.findFirst({
      where: { userId: marshall.id, orgId: org.id },
    });
    if (!existing) {
      await prisma.orgMembership.create({
        data: {
          userId: marshall.id,
          orgId: org.id,
          departmentId: deptRecords['Leadership'],
          orgRole: 'org_admin',
          inviteEmail: marshall.email,
          inviteToken: seedToken,
          joinedAt: new Date(),
        },
      });
      console.log('Added Marshall as org_admin');
    } else {
      // Ensure he's an admin
      await prisma.orgMembership.update({
        where: { id: existing.id },
        data: { orgRole: 'org_admin', joinedAt: existing.joinedAt ?? new Date() },
      });
      console.log('Marshall already a member — ensured org_admin role');
    }
  } else {
    // Create pending invite
    const seedToken = `seed-marshall-pending-${org.id}`;
    const existing = await prisma.orgMembership.findFirst({
      where: { inviteEmail: 'marshall@homelifemedia.com', orgId: org.id },
    });
    if (!existing) {
      await prisma.orgMembership.create({
        data: {
          orgId: org.id,
          departmentId: deptRecords['Leadership'],
          orgRole: 'org_admin',
          inviteEmail: 'marshall@homelifemedia.com',
          inviteToken: seedToken,
        },
      });
      console.log('Created pending org_admin invite for marshall@homelifemedia.com');
    } else {
      console.log('Pending invite already exists for marshall@homelifemedia.com');
    }
  }

  console.log('\nDone. Org ID:', org.id);
  console.log('Departments:', deptRecords);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
