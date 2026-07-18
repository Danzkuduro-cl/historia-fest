import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TOURNAMENT_NAME || 'ML Tournament Registration',
  description: 'Daftarkan tim Mobile Legends kamu sekarang!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="scanline">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(7, 11, 20, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              fontFamily: "Cambria, Georgia, serif",
              fontSize: '14px',
              backdropFilter: 'blur(12px)',
            },
            success: {
              iconTheme: { primary: '#00D4FF', secondary: '#03040A' },
            },
            error: {
              iconTheme: { primary: '#FF003C', secondary: '#03040A' },
            },
          }}
        />
      </body>
    </html>
  );
}
