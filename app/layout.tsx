// app/layout.tsx
import '../styles/globals.css'; // Global styles
import { ReactNode } from 'react';
import Header from '../app/components/Header'; // Import the Header component
import Footer from '../app/components/Footer'; // Import the Header component

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Render Header Component at the top of the page */}
        <Header />

        <main className="main-content">
          {children} {/* This renders the main content of each page */}
        </main>
        <Footer/>
      </body>
    </html>
  );
}
