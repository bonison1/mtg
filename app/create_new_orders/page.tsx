'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import styles from './Contact.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
  phone?: string; // Assuming phone is part of the user details
  address?: string; // Optional address
};

export default function Contacts() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<User[]>([]);
  const [userLink, setUserLink] = useState<string | undefined>(undefined);
  const [isLinkCreated, setIsLinkCreated] = useState<boolean>(false);
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [activeEmail, setActiveEmail] = useState<string | null>(null); // Track the clicked email
  const [userInfo, setUserInfo] = useState<User | null>(null); // Store full user details
  const [redirectLink, setRedirectLink] = useState<string | null>(null); // Track the link to redirect

  const router = useRouter();

  useEffect(() => {
    fetchContacts();
    checkUserLink();
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
      return;
    }

    if (data) {
      const contactsList = data.flatMap((entry) => entry.contact_user_id) as User[];
      setContacts(contactsList);
    }
  };

  const checkUserLink = async () => {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const { data, error } = await supabase
        .from('user_links')
        .select('link2')
        .eq('user_id', user.user_id)
        .single();

      if (error) {
        console.error('Error checking user link:', error.message);
        return;
      }

      if (data?.link2) {
        setUserLink(data.link2);
        setIsLinkCreated(true);
      }
    }
  };

  const fetchUserDetails = async (userId: string) => {
    // Fetch full user information from the 'users' table using user_id
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, phone, address') // Assuming 'phone' and 'address' exist
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user details:', error.message);
      return;
    }

    if (data) {
      setUserInfo(data); // Store the user info in state
    }
  };

  const handleEmailClick = async (contact: User) => {
    // Fetch link2 from the user_links table for the selected contact
    const { data, error } = await supabase
      .from('user_links')
      .select('link2')
      .eq('user_id', contact.user_id)
      .single();

    if (error) {
      console.error('Error fetching user link:', error.message);
      return;
    }

    if (data?.link2) {
      // If link2 exists, redirect the user to the link
      window.location.href = data.link2; // Redirect to the link
    } else {
      // If no link2 found, display information about the user and contact options
      setUserInfo(null); // Clear any previous user info
      fetchUserDetails(contact.user_id); // Fetch and display full user details
      alert('User is not allowing any incoming orders at the moment. You can contact them directly.');
    }
  };

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
        <button onClick={() => router.push('/message_data')} className={styles.messagesButton}>
          View my Orders
        </button>
        <button onClick={() => router.push('/link')} className={styles.messagesButton}>
          Mateng Delivery History
        </button>
      </div>
      <h1 className={styles.title}>Select a contact business from your contact list to send Orders</h1>

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
            <div>
              {contact.name}
              <span
                onClick={() => handleEmailClick(contact)}
                className={styles.emailLink}
              >
                {contact.email}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* User Info Section */}
      {userInfo && (
        <div className={styles.userInfo}>
          <h2>Contact Information</h2>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          {userInfo.phone && <p><strong>Phone:</strong> {userInfo.phone}</p>}
          {userInfo.address && <p><strong>Address:</strong> {userInfo.address}</p>}
          <p><strong>Note:</strong> This user is not accepting incoming orders at the moment. You can reach out to them directly using the above contact information.</p>
        </div>
      )}
    </div>
  );
}
