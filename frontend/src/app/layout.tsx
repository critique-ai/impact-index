import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The H-Index of Things',
  description: 'Discover the impact and reach of content creators across different platforms through the lens of the H-index metric.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}