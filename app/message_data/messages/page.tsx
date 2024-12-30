'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Initialize useRouter for navigation
import { supabase } from '../../../lib/supabaseClient';
import styles from './messages.module.css';

type Message = {
  sender_name: string;
  sender_id: string;
  message_content: string;
  timestamp: string;
};

export default function Dashboard() {
  const [incomingMessages, setIncomingMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);  // State for sent messages
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);  // State for storing the selected message
  const [isModalOpen, setIsModalOpen] = useState(false);  // State for controlling modal visibility
  const router = useRouter();  // Initialize useRouter for navigation

  // Fetch incoming messages and sent messages on component mount
  useEffect(() => {
    fetchIncomingMessages();
    fetchSentMessages();
  }, []);

  // Fetch incoming messages (messages the user has received)
  const fetchIncomingMessages = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        message_content,
        timestamp,
        sender_id (
          name
        )
      `)
      .eq('receiver_id', user.user_id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching incoming messages:', error.message);
    } else {
      // Format the incoming messages
      const formattedMessages = data.map((msg: { message_content: string; timestamp: string; sender_id: { name: string }[] }) => ({
        sender_name: msg.sender_id && msg.sender_id.length > 0 ? msg.sender_id[0].name : 'Unknown',
        sender_id: msg.sender_id && msg.sender_id.length > 0 ? msg.sender_id[0].name : '',
        message_content: msg.message_content,
        timestamp: msg.timestamp,
      }));

      setIncomingMessages(formattedMessages);
    }
  };

  // Fetch sent messages (messages the user has sent)
  const fetchSentMessages = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        message_content,
        timestamp,
        receiver_id (
          name
        )
      `)
      .eq('sender_id', user.user_id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching sent messages:', error.message);
    } else {
      // Format the sent messages
      const formattedMessages = data.map((msg: { message_content: string; timestamp: string; receiver_id: { name: string }[] }) => ({
        sender_name: 'You',  // As the user is sending the message, use "You"
        sender_id: user.user_id,
        message_content: msg.message_content,
        timestamp: msg.timestamp,
      }));

      setSentMessages(formattedMessages);
    }
  };

  // Navigate back to contacts page
  const handleGoBackToContacts = () => {
    router.push('/contacts');
  };

  // Handle the message click to open modal
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);  // Set the selected message to show its details
    setIsModalOpen(true);  // Open the modal
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);  // Close the modal
    setSelectedMessage(null);  // Clear the selected message
  };

  return (
    <div>
      <div className={styles.container}>
              {/* Buttons for Desktop and Tablet View */}
        <div className={styles.buttonGroup}>
        <button onClick={() => router.push('/discover')} className={styles.messagesButton}>
          Discover
        </button>
        <button onClick={() => router.push('/contacts')} className={styles.messagesButton}>
          My Contacts
        </button>
        <button onClick={() => router.push('/message_data')} className={styles.messagesButton}>
          View my Orders
        </button>
        <button onClick={() => router.push('/link')} className={styles.messagesButton}>
          Mateng Delivery History
        </button>
      </div>
        <h1 className={styles.title}>Dashboard</h1>

        {/* Sent Messages Section */}
        <div className={styles.messagesPanel}>
          <h2>Sent Messages</h2>
          {sentMessages.length > 0 ? (
            <ul className={styles.messagesList}>
              {sentMessages.map((msg, index) => (
                <li 
                  key={index} 
                  className={styles.messageItem} 
                  onClick={() => handleSelectMessage(msg)}  // Show message details in the modal
                >
                  <p><strong>To:</strong> {msg.sender_name === 'You' ? 'Recipient' : msg.sender_name}</p>
                  <p><strong>Message:</strong> {msg.message_content}</p>
                  <p><strong>Sent:</strong> {new Date(msg.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sent messages.</p>
          )}
        </div>

        {/* Incoming Messages Section */}
        <div className={styles.messagesPanel}>
          <h2>Incoming Messages</h2>
          {incomingMessages.length > 0 ? (
            <ul className={styles.messagesList}>
              {incomingMessages.map((msg, index) => (
                <li 
                  key={index} 
                  className={styles.messageItem} 
                  onClick={() => handleSelectMessage(msg)}  // Show message details in the modal
                >
                  <p><strong>From:</strong> {msg.sender_name}</p>
                  <p><strong>Message:</strong> {msg.message_content}</p>
                  <p><strong>Received:</strong> {new Date(msg.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No incoming messages.</p>
          )}
        </div>

        {/* Go Back to Contacts Button */}
        <div className={styles.goBackButtonContainer}>
          <button 
            onClick={handleGoBackToContacts} 
            className={styles.goBackButton}
          >
            Go Back to Contacts
          </button>
        </div>

        {/* Modal for Message Details */}
        {isModalOpen && selectedMessage && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Message Details</h2>
              <p><strong>From:</strong> {selectedMessage.sender_name}</p>
              <p><strong>Message Content:</strong> {selectedMessage.message_content}</p>
              <p><strong>Received/Sent:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</p>
              <button onClick={handleCloseModal} className={styles.closeModalButton}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
