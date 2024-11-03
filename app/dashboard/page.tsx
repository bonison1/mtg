'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import styles from './Dashboard.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
  is_business_owner?: boolean;
  business_name?: string;
  business_address?: string;
  product_service?: string;
  photo?: string;
};

type Message = {
  sender_name: string;
  message_content: string;
  timestamp: string;
};

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [incomingMessages, setIncomingMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [businessOwners, setBusinessOwners] = useState<User[]>([]);

  useEffect(() => {
    fetchAllUsers();
    fetchIncomingMessages();
    fetchContacts();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        setAllUsers(data || []);
        const owners = data?.filter(user => user.is_business_owner) || [];
        setBusinessOwners(owners);
      }
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
    }
  };

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
      const formattedMessages = data.map((msg: { message_content: string; timestamp: string; sender_id: { name: string }[] }) => ({
        sender_name: msg.sender_id?.[0]?.name || 'Unknown',
        message_content: msg.message_content,
        timestamp: msg.timestamp,
      }));
      setIncomingMessages(formattedMessages);
    }
  };

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
      return;
    }

    if (data) {
      const contactsList = data.flatMap((entry) => entry.contact_user_id) as User[];
      setContacts(contactsList);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);

    if (searchValue) {
      const filteredSuggestions = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchValue.toLowerCase()) &&
          !contacts.some(contact => contact.user_id === user.user_id)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const addToContacts = async (user: User) => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const currentUser = JSON.parse(userJson);
    if (contacts.find(contact => contact.user_id === user.user_id)) {
      alert(`${user.name} is already in your contacts.`);
      return;
    }

    const { error } = await supabase.from('user_contacts').insert([
      {
        user_id: currentUser.user_id,
        contact_user_id: user.user_id,
      },
    ]);

    if (error) {
      console.error('Error adding to contacts:', error.message);
    } else {
      alert(`Added ${user.name} to contacts.`);
      setContacts([...contacts, user]);
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Dashboard</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search businesses and people"
          value={search}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ul className={styles.suggestionsList}>
            {suggestions.map((suggestion) => (
              <li key={suggestion.user_id} className={styles.suggestionItem}>
                {suggestion.name} ({suggestion.email})
                <button onClick={() => addToContacts(suggestion)} className={styles.addContactButton}>
                  Add to Contacts
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.dashboardLayout}>
          {/* Contacts List */}
          <div className={styles.contactsPanel}>
            <h2>My Contacts</h2>
            <ul className={styles.contactsList}>
              {contacts.map((contact) => (
                <li key={contact.user_id} className={styles.contactItem}>
                  {contact.name} ({contact.email})
                </li>
              ))}
              {contacts.length === 0 && <p>No contacts found.</p>}
            </ul>
          </div>

          {/* Incoming Messages Section */}
          <div className={styles.messagesPanel}>
            <h2>Incoming Messages</h2>
            {incomingMessages.length > 0 ? (
              <ul className={styles.messagesList}>
                {incomingMessages.map((msg, index) => (
                  <li key={index} className={styles.messageItem}>
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
        </div>

        {/* Business Owners Section */}
        <div className={styles.businessOwnersPanel}>
          <h2>Business Owners</h2>
          <div className={styles.businessOwnersGrid}>
            {businessOwners.map((owner) => (
              <div key={owner.user_id} className={styles.businessOwnerBox}>
                <h3>{owner.business_name || 'N/A'}</h3>
                <p>Address: {owner.business_address || 'N/A'}</p>
                <p>Product/Service: {owner.product_service || 'N/A'}</p>
                <Image src={owner.photo || '/photo_icon.jpg'} alt="Business" width={100} height={100} className={styles.businessPhoto} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
