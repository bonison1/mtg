// app/contacts/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Contact.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
};

export default function Contacts() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) =>
        contact.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, contacts]);

  const fetchContacts = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);

    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
        contact_user_id (
          user_id,
          name,
          email
        )
      `)
      .eq('user_id', user.user_id);

    if (error) {
      console.error('Error fetching contacts:', error.message);
      return; // Exit if there was an error
    }

    if (data) {
      const contactsList = data.flatMap((entry) => entry.contact_user_id) as User[];
      setContacts(contactsList);
    }
  };

  const openMessageModal = (contact: User) => {
    setSelectedContact(contact);
    setIsMessageModalOpen(true);
    setSendStatus(null); // Reset send status
  };

  const closeMessageModal = () => {
    setSelectedContact(null);
    setMessage('');
    setIsMessageModalOpen(false);
  };

  const sendMessage = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson || !selectedContact) return;

    const user = JSON.parse(userJson);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user.user_id,
          receiver_id: selectedContact.user_id,
          message_content: message,
          status: 'sent',  // default status
          read: false,  // marks as unread initially
          timestamp: new Date(),
        },
      ]);

      if (error) {
        console.error('Error sending message:', error.message);
        setSendStatus('Failed to send message.');
      } else {
        setSendStatus('Message sent successfully!');
        closeMessageModal(); // Close the modal after sending the message
      }
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      setSendStatus('Failed to send message.');
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>My Contacts</h1>

        {/* Search Field for Contacts */}
        <input
          type="text"
          placeholder="Search contacts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        {/* Contacts List */}
        <ul className={styles.contactsList}>
          {filteredContacts.map((contact) => (
            <li key={contact.user_id} className={styles.contactItem}>
              {contact.name} ({contact.email})
              <button
                onClick={() => openMessageModal(contact)}
                className={styles.messageButton}
              >
                Send Message
              </button>
            </li>
          ))}
        </ul>

        {filteredContacts.length === 0 && (
          <p className={styles.noContactsMessage}>No contacts found.</p>
        )}
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && selectedContact && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Send Message to {selectedContact.name}</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here"
              className={styles.messageTextarea}
            />
            <button onClick={sendMessage} className={styles.sendMessageButton}>
              Send
            </button>
            {sendStatus && <p>{sendStatus}</p>}
            <button onClick={closeMessageModal} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
