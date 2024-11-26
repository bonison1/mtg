'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
  is_registered?: boolean;
  business_name?: string;
  business_address?: string;
  product_service?: string;
  phone?: string;
  website?: string;
  photo?: string;
  categories?: string[];
  ratings?: number; // For average rating
  link2?: string; // New field for link2
};

function Dashboard() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [businessOwners, setBusinessOwners] = useState<User[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<User | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
          console.error('Error fetching users:', error.message);
        } else {
          const owners = data?.filter(user => user.is_registered) || [];
          setBusinessOwners(owners);
        }
      } catch (error) {
        console.error('Unexpected error fetching users:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('categories');

        if (error) {
          console.error('Error fetching categories:', error.message);
        } else {
          const uniqueCategories = Array.from(new Set((data as { categories: string[] }[]).map((user) => user.categories).flat()));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
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

    fetchAllUsers();
    fetchCategories();
    fetchContacts();
  }, []);

  const filteredBusinessOwners = businessOwners.filter(owner =>
    (owner.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.categories?.some(category => category.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (selectedCategory ? owner.categories?.includes(selectedCategory) : true)
  );

  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        <button onClick={() => router.push('/discover')} className={styles.iconButton}>
          <Image src="/1.jpg" alt="Discover" width={40} height={40} />
          <span className={styles.buttonText}>Discover</span>
        </button>
        <button onClick={() => router.push('/contacts')} className={styles.iconButton}>
          <Image src="/2.jpg" alt="My Contacts" width={40} height={40} />
          <span className={styles.buttonText}>My Contacts</span>
        </button>
        <button onClick={() => router.push('/message_data')} className={styles.iconButton}>
          <Image src="/3.jpg" alt="View my Orders" width={40} height={40} />
          <span className={styles.buttonText}>My Orders</span>
        </button>
        <button onClick={() => router.push('/link')} className={styles.iconButton}>
          <Image src="/4.jpg" alt="Delivery History" width={40} height={40} />
          <span className={styles.buttonText}>History</span>
        </button>
      </div>

      <h1 className={styles.title}>Discover Businesses</h1>

      <input
        type="text"
        placeholder="Search by business name or category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className={styles.categorySelect}
      >
        <option value="">All Categories</option>
        {categories.map((category, idx) => (
          <option key={idx} value={category}>{category}</option>
        ))}
      </select>

      <div className={styles.businessOwnersPanel}>
        <div className={styles.businessOwnersGrid}>
          {filteredBusinessOwners.map((business, index) => (
            <div key={index} className={styles.businessOwnerBox} onClick={() => setSelectedBusiness(business)}>
              <Image
                src={business.photo || '/2.jpg'}
                alt="Business"
                width={100}
                height={100}
                className={styles.businessPhoto}
              />
              <h3>{business.business_name}</h3>
              <p>{business.categories?.join(', ')}</p>
              <p>{business.ratings ? `${business.ratings} ★` : 'No ratings yet'}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedBusiness && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBusiness(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedBusiness(null)} className={styles.closeButton}>X</button>
            <h2>{selectedBusiness.business_name || 'Business Details'}</h2>
            <Image
              src={selectedBusiness.photo || '/2.jpg'}
              alt="Business"
              width={150}
              height={150}
            />
            <p><strong>Owner:</strong> {selectedBusiness.name}</p>
            <p><strong>Email:</strong> {selectedBusiness.email}</p>
            <p><strong>Address:</strong> {selectedBusiness.business_address || 'N/A'}</p>
            <p><strong>Categories:</strong> {selectedBusiness.categories?.length ? selectedBusiness.categories.join(', ') : 'N/A'}</p>
            <p><strong>Product/Service:</strong> {selectedBusiness.product_service || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedBusiness.phone || 'N/A'}</p>
            <p><strong>Website:</strong> {selectedBusiness.website || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
