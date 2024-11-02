'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './Contacts.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
};

export default function Contacts() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<User[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    // Filter contacts based on search input
    setFilteredContacts(
      contacts.filter((contact) =>
        contact.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, contacts]);

  const fetchContacts = async () => {
    try {
      const userJson = sessionStorage.getItem('user');
      if (!userJson) {
        console.error('User not found in sessionStorage.');
        return;
      }
  
      const user = JSON.parse(userJson);
      if (!user.user_id) {
        console.error('user_id is missing from sessionStorage data.');
        return;
      }
  
      const { data, error } = await supabase
        .from('user_contacts')
        .select(`
          contact_user_id (user_id, name, email)
        `)
        .eq('user_id', user.user_id);
  
      if (error) {
        console.error('Error fetching contacts:', error?.message || error);
      } else if (data) {
        // Flatten any nested arrays
        const contactsList = data
          .map((entry) => entry.contact_user_id)
          .flat() as User[]; // Ensure it’s a flat array of User
        
        setContacts(contactsList);
        setFilteredContacts(contactsList); // Initialize filteredContacts
      }
    } catch (error) {
      console.error('Unexpected error fetching contacts:', error);
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
            </li>
          ))}
        </ul>

        {filteredContacts.length === 0 && (
          <p className={styles.noContactsMessage}>No contacts found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
