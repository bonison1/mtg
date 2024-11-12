'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
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
  phone?: string;
  website?: string;
  photo?: string;
};

function BusinessModal({ business, onClose }: { business: User; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>X</button>
        <h2>{business.business_name || 'Business Details'}</h2>
        <Image src={business.photo || '/2.jpg'} alt="Business" width={150} height={150} />
        <p><strong>Owner:</strong> {business.name}</p>
        <p><strong>Email:</strong> {business.email}</p>
        <p><strong>Address:</strong> {business.business_address || 'N/A'}</p>
        <p><strong>Product/Service:</strong> {business.product_service || 'N/A'}</p>
        <p><strong>Phone:</strong> {business.phone || 'N/A'}</p>
        <p><strong>Website:</strong> {business.website || 'N/A'}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [businessOwners, setBusinessOwners] = useState<User[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<User | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
          console.error('Error fetching users:', error.message);
        } else {
          setAllUsers(data || []);
          const owners = data?.filter(user => user.is_business_owner) || [];
          setBusinessOwners(owners);

          console.log(allUsers); // placeholder for future use

        }
      } catch (error) {
        console.error('Unexpected error fetching users:', error);
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

    fetchAllUsers(); // Fetch users
    fetchContacts(); // Fetch contacts
  }, [allUsers]); // Empty dependency array, so it only runs once on mount

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
      <div className={styles.container}>
        <h1 className={styles.title}>Dashboard</h1>

        {/* Business Owners Section */}
        <div className={styles.businessOwnersPanel}>
          <h2>Business Owners</h2>
          <div className={styles.businessOwnersGrid}>
            {businessOwners.map((owner) => {
              const isInContacts = contacts.some(contact => contact.user_id === owner.user_id);
              return (
                <div
                  key={owner.user_id}
                  className={styles.businessOwnerBox}
                  onClick={() => setSelectedBusiness(owner)}
                >
                  <Image src={owner.photo || '/2.jpg'} alt="Business" width={100} height={100} className={styles.businessPhoto} />
                  <h3>{owner.business_name || 'N/A'}</h3>
                  <p>Address: {owner.business_address || 'N/A'}</p>
                  <p>Product/Service: {owner.product_service || 'N/A'}</p>
                  {isInContacts ? (
                    <button className={styles.inContactsButton} disabled>
                      Already in Contacts
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); addToContacts(owner); }} className={styles.addContactButton}>
                      Add to Contacts
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </div>
  );
}
