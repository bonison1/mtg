'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Message } from '../../types/message'; // Define the Message type
import styles from './MessageData.module.css';

export default function MessageDataPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      if (!user?.email) {
        router.push('/login'); // Redirect to login if no email is found
        return;
      }

      try {
        // Fetch messages from Supabase where the email matches the logged-in user
        const { data: fetchedMessages, error: fetchError } = await supabase
          .from('message_data')
          .select('*')
          .eq('email', user.email);

        if (fetchError) {
          throw new Error(fetchError.message);  // Explicitly use fetchError
        }

        if (fetchedMessages) {
          setMessages(fetchedMessages);  // Use fetchedMessages here
          setFilteredMessages(fetchedMessages);  // Set filteredMessages initially to all messages
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  // Handle status change
  const handleStatusChange = async (id: number, status: string | undefined) => {
    if (!status) return; // If the status is undefined or empty, do nothing

    try {
      // Update the status in Supabase
      const { error } = await supabase
        .from('message_data')
        .update({ status })
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Update the status in the local state without refetching all data
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === id ? { ...message, status } : message
        )
      );

      // Filter the updated messages list
      setFilteredMessages((prevFilteredMessages) =>
        prevFilteredMessages.map((message) =>
          message.id === id ? { ...message, status } : message
        )
      );

      // Set success message
      setSaveMessage('Status updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000); // Hide after 3 seconds
    } catch (error) {
      setError('Failed to update status');
    }
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setFilterStatus(status);

    if (status === 'All') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter((msg) => msg.status === status));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.messageTitle}>Your Messages</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      {saveMessage && <p className={styles.statusMessage}>{saveMessage}</p>}

      <div className={styles.filterContainer}>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={handleFilterChange}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Sorry can't able to give order at this moment">
            Sorry can&apos;t give order at this moment
          </option>
        </select>
      </div>

      {filteredMessages.length === 0 ? (
        <p>No messages found for your selected status.</p>
      ) : (
        <table className={styles.messagesTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Mobile Number</th>
              <th>Message</th>
              <th>Created At</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message.id}>
                <td>{message.id}</td>
                <td>{message.name}</td>
                <td>{message.address}</td>
                <td>{message.mobile_number}</td>
                <td>{message.message}</td>
                <td>{new Date(message.created_at).toLocaleString()}</td>
                <td>{message.email}</td>
                <td
                  className={
                    message.status === 'Pending'
                      ? styles.statusPending
                      : message.status === 'In-Progress'
                      ? styles.statusInProgress
                      : message.status === 'Out for Delivery'
                      ? styles.statusOutForDelivery
                      : message.status === "Sorry can't able to give order at this moment"
                      ? styles.statusNotAvailable
                      : ''
                  }
                >
                  {message.status || 'Pending'}
                </td>
                <td>
                  <select
                    value={message.status || 'Pending'}
                    onChange={(e) => handleStatusChange(message.id, e.target.value)}
                    className={styles.statusDropdown}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Sorry can't able to give order at this moment">
                      Sorry can&apos;t give order at this moment
                    </option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}