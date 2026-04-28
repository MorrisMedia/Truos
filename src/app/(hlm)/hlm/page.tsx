import { requireHlmRole } from './_lib/hlm-auth';
import { redirect } from 'next/navigation';

export default async function HlmRoot() {
  const { membership } = await requireHlmRole();
  if (membership.orgRole === 'org_admin') redirect('/hlm/admin');
  if (membership.orgRole === 'org_manager') redirect('/hlm/manager');
  redirect('/hlm/learn');
}
