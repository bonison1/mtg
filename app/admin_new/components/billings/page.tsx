'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Dropdowns from './Dropdowns';
import styles from './crud.module.css';

const Page = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    team: '',
    pb: '',
    dc: '',
    cid: '',
  });

  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchLatestEntries();
  }, []);

  const fetchLatestEntries = async () => {
    const { data, error } = await supabase
      .from('order_data')
      .select('*')
      .eq('type', 'billing') // Filter by type = "billing"
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching records:', error.message);
    } else {
      setRecords(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cid = Number(formData.cid || 0);
    const tsb = formData.pb === 'Bill Settlement' ? -cid : cid;

    const preparedFormData = {
      ...formData,
      cid,
      tsb,
      type: 'billing', // Set the type as "billing"
    };

    try {
      const { error } = await supabase.from('order_data').insert([preparedFormData]);
      if (error) throw new Error(error.message);

      fetchLatestEntries();

      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        team: '',
        pb: '',
        dc: '',
        cid: '',
      });
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading1}>Create New Record</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={styles.inputField}
            readOnly
          />
        </div>

        <Dropdowns formData={formData} handleChange={handleChange} />

        <div>
          <label>CID:</label>
          <input
            type="number"
            name="cid"
            value={formData.cid}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>

      <h2 className={styles.heading}>Latest Billing Records</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Team</th>
            <th>CID</th>
            <th>TSB</th>
            <th>Bill Payment Reason</th>
            <th>Mode of Payment</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.vendor}</td>
              <td>{record.team}</td>
              <td>{record.cid}</td>
              <td>{record.tsb}</td>
              <td>{record.pb}</td>
              <td>{record.dc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
