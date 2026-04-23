import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Truos — AI Training for Commercial Teams',
  description: '148 lessons across 6 courses. From zero tech knowledge to shipping a real AI workflow.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://truos.ai'),
  openGraph: { title: 'Truos', description: 'AI training for commercial teams.', url: 'https://truos.ai' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
