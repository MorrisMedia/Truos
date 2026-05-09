import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TRU — Truos rapid AI onboarding',
  description: 'Private link only.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function TruLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
