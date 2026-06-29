import type { Metadata } from 'next';
import './globals.css';
import ClientProvider from './ClientProvider';

export const metadata: Metadata = {
  title: 'BinAzeem — Premium Fashion',
  description: 'Premium clothing for the modern wardrobe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
