import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import './globals.css';
import { SitesProvider } from '@/components/SitesProvider';
import { getSites } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import type { Site } from '@/types';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The H-Index of Things',
  description: 'Discover the impact and reach of content creators across different platforms through the lens of the H-index metric.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sites = await getSites();

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SitesProvider initialSites={sites}>
            <Navbar />
            <main>{children}</main>
          </SitesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}