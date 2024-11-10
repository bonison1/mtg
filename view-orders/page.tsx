'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ViewOrders.module.css';

type OrderData = {
  [key: string]: any; // Dynamically typed to hold any column data
};

export default function ViewOrders() {
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      fetchOrderData(user.name);
    }
    setLoading(false);
  }, []);

  const fetchOrderData = async (userName: string) => {
    try {
      const { data, error } = await supabase.from('order_data').select('*').eq('name', userName);
      if (error) throw error;
      setOrderData(data || []);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  // Get the column headers from the first row of data (if available)
  const columnHeaders = orderData.length > 0 ? Object.keys(orderData[0]) : [];

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Your Orders</h1>
        {orderData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                {columnHeaders.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderData.map((item, index) => (
                <tr key={index}>
                  {columnHeaders.map((header) => (
                    <td key={header}>{item[header]}</td>
                  ))}
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
