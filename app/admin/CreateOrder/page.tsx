'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RecordForm from './RecordForm';
import EditableTable from './edit';
import { supabase } from '../../../lib/supabaseClient';
import styles from './crud.module.css';

interface Vendor {
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Record {
  id: string;
  createdAt: string;
  // Define other record fields as needed
}

const Page = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; column: string } | null>(null);

  useEffect(() => {
    fetchVendors();
    fetchRecords();
  }, []);

  const fetchVendors = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('is_business_owner', true);
    if (error) {
      console.error('Error fetching vendors:', error.message);
    } else {
      setVendors(data || []);
    }
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase.from('order_data').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) {
      console.error('Error fetching records:', error.message);
    } else {
      setRecords(data || []);
    }
  };


  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.heading1}>Create New Record</h1>
        <RecordForm vendors={vendors} onSubmitSuccess={fetchRecords} />

        <h2 className={styles.heading}>Latest Records</h2>
      </div>
    </Layout>
  );
};

export default Page;
