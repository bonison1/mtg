/* eslint-disable react/no-unescaped-entities */
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
  const [selectedOption, setSelectedOption] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      if (!user?.email) {
        router.push('/login'); // Redirect to login if no email is found
        return;
      }

      try {
        // Fetch messages from Supabase where the sender_email matches the logged-in user's email
        const { data: fetchedMessages, error: fetchError } = await supabase
          .from('message_data')
          .select('*')
          .eq('sender_email', user.email);  // Changed 'email' to 'sender_email'

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

  // Handle dropdown selection change
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedOption(selected);

    if (selected === 'Sent Orders') {
      router.push('/message_data/sent_message');
    } else if (selected === 'Customer Orders') {
      router.push('/message_data');
    } else if (selected === 'Discover') {
      router.push('/discover');
    } else if (selected === 'Messages') {
      router.push('/messages');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      {/* Buttons for Desktop and Tablet View */}
      <div className={styles.buttonGroup}>
        <button onClick={() => router.push('/discover')} className={styles.messagesButton}>
          Discover
        </button>
        <button onClick={() => router.push('/contacts')} className={styles.messagesButton}>
          My Contacts
        </button>
        <button onClick={() => router.push('/message_data/sent_message')} className={styles.messagesCont}>
          Messages
        </button>
      </div>
      
      {/* Create Order Button */}
      <div className={styles.createOrderButtonContainer}>
        <button onClick={() => router.push('/create_new_orders')} className={styles.createOrderButton}>Create an Order</button>
      </div>

      <h2 className={styles.messageTitle}>Order by you to others</h2>

      {/* Dropdown Wrapper */}
      <div className={styles.dropdownWrapper}>
        {/* Left Dropdown: Order Type */}
        <div className={styles.dropdownContainerLeft}>
          <label className={styles.dropdownLabel} htmlFor="orderType">Select Order Type</label>
          <select
            id="orderType"
            className={styles.dropdownSelect}
            value={selectedOption}
            onChange={handleDropdownChange}
          >
            <option value="Customer Orders">Customer Orders</option>
            <option value="Sent Orders">Sent Orders</option>
          </select>
        </div>

        {/* Right Dropdown: Status Filter */}
        <div className={styles.dropdownContainerRight}>
          <label className={styles.filterLabel} htmlFor="statusFilter">Select Status</label>
          <select
            id="statusFilter"
            className={styles.filterSelect}
            value={filterStatus}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Sorry can't able to give order at this moment">
              Sorry can't give order at this moment
            </option>
          </select>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {saveMessage && <p className={styles.statusMessage}>{saveMessage}</p>}

      {/* Message Table */}
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
                <td>{message.sender_email}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
