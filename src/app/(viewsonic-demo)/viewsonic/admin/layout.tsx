import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Pulse',   href: '/viewsonic/admin' },
  { label: 'People',  href: '/viewsonic/admin/people' },
  { label: 'Onboard', href: '/viewsonic/admin/onboard' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '32px 32px 80px' }}>{children}</div>
    </>
  );
}
