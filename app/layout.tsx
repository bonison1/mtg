// app/layout.tsx

import '../styles/globals.css';
import { ReactNode } from 'react';
import Header from '../app/components/Header';
import Footer from '../app/components/Footer';
import { AuthProvider } from '../app/context/AuthContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main className="main-content">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
