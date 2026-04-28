import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Home',         href: '/viewsonic/learn' },
  { label: 'Courses',      href: '/viewsonic/learn/courses' },
  { label: 'Certificates', href: '/viewsonic/learn/certificates' },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '48px 32px 80px' }}>{children}</div>
    </>
  );
}
