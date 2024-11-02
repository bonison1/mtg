'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AddData() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleNameChange = async (value: string) => {
    setName(value);
    setMessage(null);

    if (value.trim()) {
      // Fetch user email based on the entered name
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('name', value)
        .limit(1)
        .single();

      if (error) {
        setMessage(`No email found for the name: ${value}`);
        setEmail(''); // Clear email if no match is found
      } else if (data) {
        setEmail(data.email); // Set email if match is found
      }
    } else {
      setEmail(''); // Clear email if name field is empty
    }
  };

  const handleAddData = async () => {
    if (!name || !email || !to || !from) {
      setMessage('All fields are required');
      return;
    }

    try {
      // Get the current user to ensure they are logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage('User not logged in');
        return;
      }

      // Insert data into `user_data` table
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          name,
          email,
          to,
          from,
        });

      if (error) {
        throw new Error(error.message);
      }

      setMessage('Data added successfully');
      setName('');
      setEmail('');
      setTo('');
      setFrom('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1>Add Data</h1>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="email"
            placeholder="Email (autofilled)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            readOnly
          />
          <input
            type="text"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button onClick={handleAddData} style={{ width: '100%', padding: '10px' }}>
            Add Data
          </button>

          {/* Display success or error message */}
          {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
