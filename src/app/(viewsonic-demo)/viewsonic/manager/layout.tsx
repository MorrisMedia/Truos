import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Pulse', href: '/viewsonic/manager' },
  { label: 'Team',  href: '/viewsonic/manager/team' },
  { label: 'Nudge', href: '/viewsonic/manager/nudge' },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '32px 32px 80px' }}>{children}</div>
    </>
  );
}
