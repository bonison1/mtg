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

  const generateUserLink = async () => {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const uniqueLink = `send-message/${user.user_id}`; // Prepend 'mateng.co.in/future/' to the user ID
  
      const { error } = await supabase
        .from('user_links')
        .upsert([{ user_id: user.user_id, link2: uniqueLink }]);
  
      if (error) {
        console.error('Error generating user link:', error.message);
        setLinkStatus("There was an error generating your link.");
        return;
      }
  
      setUserLink(uniqueLink);
      setIsLinkCreated(true);
      setLinkStatus("Link created successfully!");
    }
  };
  
  const openMessageModal = (contact: User) => {
    setSelectedContact(contact);
    setIsMessageModalOpen(true);
    setSendStatus(null);
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
          status: 'sent',
          read: false,
          timestamp: new Date(),
        },
      ]);

      if (error) {
        console.error('Error sending message:', error.message);
        setSendStatus('Failed to send message.');
      } else {
        setSendStatus('Message sent successfully!');
        closeMessageModal();
      }
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      setSendStatus('Failed to send message.');
    }
  };

  const handleEmailClick = (email: string) => {
    setActiveEmail(email === activeEmail ? null : email);
  };

  return (
    <div>
      <div className={styles.container}>
        {/* Buttons for Desktop and Tablet View */}
        <div className={styles.buttonGroup}>
        <button onClick={() => router.push('/discover')} className={styles.messagesButton}>
          Discover
        </button>
        <button onClick={() => router.push('/contacts')} className={styles.messagesCont}>
          My Contacts
        </button>
        <button onClick={() => router.push('/message_data')} className={styles.messagesButton}>
          View my Orders
        </button>
        <button onClick={() => router.push('/link')} className={styles.messagesButton}>
          Mateng Delivery History
        </button>
      </div>
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
              <div>
                {contact.name}
                <span
                  onClick={() => handleEmailClick(contact.email)}
                  className={styles.emailLink}
                >
                  {contact.email}
                </span>

                {activeEmail === contact.email && (
                  <div>
                    <Link href={`/send-message/message/${contact.user_id}`} passHref>
                      <button className={styles.viewMessagesButton}>View Messages</button>
                    </Link>

                    <button onClick={() => openMessageModal(contact)} className={styles.messageButton}>
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filteredContacts.length === 0 && <p className={styles.noContactsMessage}>No contacts found.</p>}

        {!isLinkCreated ? (
          <button onClick={generateUserLink} className={styles.generateLinkButton}>
            Create My Unique Link
          </button>
        ) : (
          <div className={styles.userLinkContainer}>
            <h2>Your Unique Link:</h2>
            <p><strong>Share this link to allow others to send you Order:</strong></p>
            {userLink && (
              <Link href={userLink} passHref className={styles.userLink}>
                {userLink}
              </Link>
            )}
            <div className={styles.qrCodeContainer}>
              {userLink && <QRCode value={userLink} size={256} />}
            </div>
          </div>
        )}

        {linkStatus && <p className={styles.linkStatusMessage}>{linkStatus}</p>}
      </div>

      

      {/* Mobile Specific Buttons 
      <div className={styles.mobileButtons}>
        <button onClick={() => router.push('/delivery-rates')} className={styles.deliveryButton}>
          Delivery Rates
        </button>
        <button onClick={() => router.push('/delivery-orders')} className={styles.deliveryButton}>
          View my Delivery Orders
        </button>
      </div> */}

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
            <button onClick={sendMessage} className={styles.sendMessageButton}>Send</button>
            {sendStatus && <p>{sendStatus}</p>}
            <button onClick={closeMessageModal} className={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
