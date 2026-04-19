import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Insectia - Terrarium Manager',
  description: 'Minimalistyczna aplikacja do zarządzania terrariami dla straszyków.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pl" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('insectia_theme') || 'light';
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
          })()
        ` }} />
      </head>
      <body className="font-sans bg-[var(--bg-page)] text-[var(--text-main)] antialiased transition-colors duration-300" suppressHydrationWarning>
        <div className="mx-auto max-w-md bg-[var(--bg-page)] min-h-[100dvh] shadow-xl relative overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
