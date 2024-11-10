'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TeamSignup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  // Generate a random team code (this is just an example; use a more secure method in production)
  const generateTeamCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTeamCode(code);
  };

  const handleSignup = async () => {
    try {
      // Insert user data into the `team_users` table directly
      const { data, error } = await supabase.from("team_users").insert([
        {
          username,
          email,
          password, // In a real app, ensure to hash the password before storing it in production
          team_code: teamCode || "DEFAULT", // Use generated or default team code
        },
      ]);

      if (error) {
        throw new Error(error.message); // This will throw a general Error object
      }

      setSuccessMessage("Signup successful! Your Team Code: " + teamCode);
      setUsername("");
      setEmail("");
      setPassword("");
      setTeamCode(""); // Clear fields
    } catch (error: unknown) {
      // Type narrowing to handle different error types
      if (error instanceof Error) {
        setErrorMessage("Signup error: " + error.message); // Use error.message
      } else {
        setErrorMessage("Signup error: Unknown error occurred");
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Header/>
      <h1>Team Signup</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>

      {/* Team Code Section */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="teamCode">Team Code</label>
        <input
          id="teamCode"
          type="text"
          value={teamCode}
          readOnly
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          onClick={generateTeamCode}
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Generate Team Code
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSignup}
        style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px',
        }}
      >
        Sign Up
      </button>

      {/* Success or Error Message */}
      {successMessage && (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <strong>{successMessage}</strong>
        </div>
      )}
      {errorMessage && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <Link href="/team-login">
          Log in if you have registered already.
      </Link>

      <Footer/>
    </div>

  );
}
