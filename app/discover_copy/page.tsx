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

function BusinessModal({
  business,
  onClose,
  onRate,
}: {
  business: User;
  onClose: () => void;
  onRate: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          X
        </button>
        <h2>{business.business_name || 'Business Details'}</h2>
        <Image
          src={business.photo || '/default-business.jpg'}
          alt="Business"
          width={150}
          height={150}
        />
        <p><strong>Owner:</strong> {business.name}</p>
        <p><strong>Email:</strong> {business.email}</p>
        <p><strong>Business Address:</strong> {business.business_address || 'N/A'}</p>
        <p><strong>Categories:</strong> {business.categories?.length ? business.categories.join(', ') : 'N/A'}</p>
        <p><strong>Product/Service:</strong> {business.product_service || 'N/A'}</p>
        <p><strong>Phone:</strong> {business.phone || 'N/A'}</p>
        <p><strong>Website:</strong> {business.website || 'N/A'}</p>

        {/* Display the link2 if available */}
        {business.link2 && (
          <p><strong>Order Link:</strong> <a href={business.link2} target="_blank" rel="noopener noreferrer">{business.link2}</a></p>
        )}

        <div>
          <h4>Rate this Business</h4>
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRatingChange(star)}
                style={{
                  cursor: 'pointer',
                  color: star <= rating ? 'gold' : 'gray',
                  fontSize: '1.5rem',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <button onClick={() => onRate(rating)} className={styles.addContactButton}>
            Submit Rating
          </button>
        </div>

        <div>
          <p><strong>Average Rating:</strong> {business.ratings || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
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

          // Fetch user_links and add the link2 to the business data
          const usersWithLinks = await Promise.all(
            owners.map(async (user) => {
              const { data: userLinksData, error: linksError } = await supabase
                .from('user_links')
                .select('link2')
                .eq('user_id', user.user_id);

              if (linksError) {
                console.error('Error fetching user links:', linksError.message);
              } else {
                user.link2 = userLinksData?.[0]?.link2 || ''; // Add link2 to the user object
              }

              return user;
            })
          );

          setBusinessOwners(usersWithLinks);
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

  const removeFromContacts = async (user: User) => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const currentUser = JSON.parse(userJson);
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('user_id', currentUser.user_id)
      .eq('contact_user_id', user.user_id);

    if (error) {
      console.error('Error removing from contacts:', error.message);
    } else {
      alert(`Removed ${user.name} from contacts.`);
      setContacts(contacts.filter(contact => contact.user_id !== user.user_id));
    }
  };

  const giveRating = async (rating: number, business: User) => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const currentUser = JSON.parse(userJson);
    const { error } = await supabase
      .from('ratings')
      .upsert([
        {
          user_id: currentUser.user_id,
          business_user_id: business.user_id,
          rating: rating,
        },
      ]);

    if (error) {
      console.error('Error submitting rating:', error.message);
    } else {
      alert(`Rated ${business.business_name} with ${rating} stars!`);
    }
  };

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
                src={business.photo || '/default-business.jpg'}
                alt="Business"
                width={100}
                height={100}
                className={styles.businessPhoto}
              />
              <h3>{business.business_name}</h3>
              <p>{business.product_service}</p>
              <p>{business.business_address}</p>
              <p>{business.phone}</p>

              <p>{business.ratings ? `${business.ratings} ★` : 'No ratings yet'}</p>
              {contacts.some((contact) => contact.user_id === business.user_id) ? (
                <button
                  className={styles.inContactsButton}
                  onClick={() => removeFromContacts(business)}
                >
                  Remove from Contacts
                </button>
              ) : (
                <button
                  className={styles.addContactButton}
                  onClick={() => addToContacts(business)}
                >
                  Add to Contacts
                </button>
              )}

            </div>
          ))}
        </div>
      </div>

      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onRate={(rating) => giveRating(rating, selectedBusiness)}
        />
      )}
    </div>
  );
}
