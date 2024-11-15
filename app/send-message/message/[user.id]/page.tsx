'use client';

import { useState, useEffect } from 'react';
import { useParams, } from 'next/navigation'; // for dynamic user_id from URL
import { supabase } from '../../../../lib/supabaseClient';
import styles from './message.module.css'; // Add CSS file for styling

type Message = {
  id: string;
  sender_name: string;
  sender_email: string;
  message_content: string;
  timestamp: string;
};

export default function MessagePage() {
  const { user_id } = useParams(); // Get user_id from URL
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Debug: Check if sessionStorage has the user email
    const userJson = sessionStorage.getItem('user');
    console.log('User JSON:', userJson); // Debugging log
    if (userJson) {
      const user = JSON.parse(userJson);
      console.log('User Email:', user.email); // Debugging log
      setUserEmail(user.email);  // Store the logged-in user's email
    }

    if (!user_id) return;

    // Fetch messages after we get the user's email
    const fetchMessages = async () => {
      if (!userEmail) {
        console.log('No user email available'); // Debugging log
        return;
      }
      
      setLoading(true);

      // Query messages where the 'email' matches the logged-in user's email
      const { data, error } = await supabase
        .from('message_data')
        .select('*')
        .eq('email', userEmail) // Use logged-in user's email to filter messages
        .order('timestamp', { ascending: false }); // Order by timestamp (latest first)

      if (error) {
        console.error('Error fetching messages:', error.message);
        setError('Error loading messages');
      } else {
        console.log('Fetched Messages:', data); // Debugging log
        setMessages(data || []);
      }

      setLoading(false);
    };

    if (userEmail) {
      fetchMessages();
    }
  }, [user_id, userEmail]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Incoming Messages</h1>

      {/* Show a message if no messages are found */}
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul className={styles.messageList}>
          {messages.map((message) => (
            <li key={message.id} className={styles.messageItem}>
              <div>
                <strong>{message.sender_name}</strong>
              </div>
              <div>{message.message_content}</div>
              <div className={styles.timestamp}>
                <small>{new Date(message.timestamp).toLocaleString()}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
