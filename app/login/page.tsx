'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(null);

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('user_id, name, email')
        .eq('email', email)
        .eq('password', password);

      if (error) throw new Error(error.message);

      if (users && users.length > 0) {
        const user = users[0];
        sessionStorage.setItem('user', JSON.stringify(user));
        alert('Login successful!');
        router.push('/dashboard');
      } else {
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error logging in:', error.message);
        setErrorMessage(error.message);
      } else {
        console.error('Unknown error:', error);
        setErrorMessage('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button onClick={handleLogin} style={{ width: '100%', padding: '10px' }}>
          Log In
        </button>

        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/forgot-password" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Forgot Password?
          </Link>
          <br /><br/>
          <Link href="/signup" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Sign Up if you're a new user
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
