// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/home'); // Redirect to /home page after a short delay
  }, [router]);

  return (
    <div className="page-container">
      <div className="loading-container">
        <div className="loading-content">
          <p>Loading...</p>
        </div>
      </div>
      <footer className="footer">
        <p>© 2024 Your Company</p>
      </footer>
    </div>
  );
}
