-- CreateTable
CREATE TABLE "truos_org_departments" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,

    CONSTRAINT "truos_org_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truos_org_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT NOT NULL,
    "departmentId" TEXT,
    "orgRole" TEXT NOT NULL DEFAULT 'member',
    "inviteEmail" TEXT,
    "inviteToken" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "truos_org_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "truos_org_departments_orgId_name_key" ON "truos_org_departments"("orgId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "truos_org_memberships_inviteToken_key" ON "truos_org_memberships"("inviteToken");

-- CreateIndex
CREATE INDEX "truos_org_memberships_orgId_idx" ON "truos_org_memberships"("orgId");

-- CreateIndex
CREATE INDEX "truos_org_memberships_userId_idx" ON "truos_org_memberships"("userId");

-- CreateIndex
CREATE INDEX "truos_org_memberships_inviteToken_idx" ON "truos_org_memberships"("inviteToken");

-- AddForeignKey
ALTER TABLE "truos_org_departments" ADD CONSTRAINT "truos_org_departments_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "truos_orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truos_org_memberships" ADD CONSTRAINT "truos_org_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "truos_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truos_org_memberships" ADD CONSTRAINT "truos_org_memberships_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "truos_orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truos_org_memberships" ADD CONSTRAINT "truos_org_memberships_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "truos_org_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
