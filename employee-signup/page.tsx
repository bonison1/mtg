'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../app/components/Header';
import Footer from '../app/components/Footer';

export default function EmployeeSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    if (name === '' || email === '' || password.length < 3) {
      setErrorMessage('All fields are required and password must be at least 3 characters');
      return;
    }

    try {
      // Insert employee credentials into the `employees` table with role set to "employee"
      const { error } = await supabase.from('employees').insert({
        name,
        email,
        password, // Use hashed passwords in production
        role: 'employee', // Assign role as "employee"
      });

      if (error) throw new Error(error.message);

      setSuccessMessage('Signup successful! Redirecting to login...');
      setTimeout(() => router.push('/employee-login'), 2000); // Redirect to login
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <h1>Employee Signup</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
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
        <button onClick={handleSignup} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          Sign Up
        </button>

        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}
      </main>
      <Footer />
    </div>
  );
}
