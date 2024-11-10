'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../app/components/Header';
import Footer from '../app/components/Footer';
import Link from 'next/link'; // Import Link from Next.js

export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleEmployeeLogin = async () => {
    try {
      // Query the employees table directly for email, password, and role
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', password);

      if (error) throw new Error(error.message);

      if (employees && employees.length > 0) {
        const employee = employees[0];

        // Check if the employee's role is "employee"
        if (employee.role === 'employee') {
          // Store the logged-in employee’s data in session storage
          sessionStorage.setItem('employee', JSON.stringify(employee));
          router.push('/employee-dashboard'); // Redirect to employee dashboard
        } else {
          setErrorMessage('Access denied: You are not an employee');
        }
      } else {
        setErrorMessage('Invalid login credentials');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <h1>Employee Login</h1>
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
        <button onClick={handleEmployeeLogin} style={{ width: '100%', padding: '10px' }}>
          Log In
        </button>

        {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}

        {/* Add the Sign Up Link */}
        <div style={{ marginTop: '10px' }}>
          <p>Don't have an account? <Link href="/employee-s" style={{ color: '#0070f3', textDecoration: 'underline' }}>Sign up</Link></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
