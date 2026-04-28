import { TabStrip } from '../_components/TabStrip';

const TABS = [
  { label: 'Home',         href: '/hlm/learn' },
  { label: 'Courses',      href: '/hlm/learn/courses' },
  { label: 'Certificates', href: '/hlm/learn/certificates' },
];

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabStrip tabs={TABS} />
      <div style={{ padding: '32px 32px 80px' }}>{children}</div>
    </>
  );
}
