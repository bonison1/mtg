import '../styles/globals.css';
import { ReactNode } from 'react';
import Footer from '../app/components/Footer';
import { AuthProvider } from '../app/context/AuthContext';
import ConditionalHeader from './components/ConditionalHeader';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ConditionalHeader /> {/* Header logic moved to a client component */}
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
