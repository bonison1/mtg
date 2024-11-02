'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ViewOrders.module.css';

type UserData = {
  id: string;
  name: string;
  email: string;
  to: string;
  from: string;
};

export default function ViewOrders() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      fetchUserData(user.name);
    }
    setLoading(false);
  }, []);

  const fetchUserData = async (userName: string) => {
    try {
      const { data, error } = await supabase.from('user_data').select('*').eq('name', userName);
      if (error) throw error;
      setUserData(data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Your Orders</h1>
        {userData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>To</th>
                <th>From</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.to}</td>
                  <td>{item.from}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noOrdersMessage}>No orders found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
