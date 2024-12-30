'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Dropdowns from './Dropdowns'; // Ensure this path is correct
import styles from './crud.module.css'; // Include the CSS module
import EditableTable from './edit';
import RecordForm from './RecordForm';

interface FormData {
  date: string;
  vendor: string;
  team: string;
  pb: string;
  dc: string;
  pbAmt: string;
  invoiceNumber: string;
  dcAmt: string;
  pickup: { name: string; address: string; phone: string };
  drop: { name: string; address: string; phone: string };
  orderType: string; // Ensure this property is included
}

interface Vendor {
  name: string;
  email: string;
  address: string;
  phone: string;
}
const Page = () => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    team: '',
    pb: '',
    dc: '',
    pbAmt: '',
    invoiceNumber: '',
    dcAmt: '',
    pickup: { name: '', address: '', phone: '' },
    drop: { name: '', address: '', phone: '' },
    orderType: '',
  });

  const [records, setRecords] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [useVendorPickup, setUseVendorPickup] = useState(false);
  const [useVendorDrop, setUseVendorDrop] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; column: string } | null>(null);

  useEffect(() => {
    fetchLatestEntries();
    fetchVendors();
  }, []);

  const fetchLatestEntries = async () => {
    const { data, error } = await supabase
      .from('order_data')
      .select('*')
      .eq('type', 'pickupanddrop')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching records:', error.message);
    } else {
      setRecords(data || []);
    }
  };

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('name, email, address, phone')
      .eq('is_business_owner', true);

    if (error) {
      console.error('Error fetching vendors:', error.message);
    } else {
      setVendors(data || []);
    }
  };

  const calculateValues = () => {
    const pbAmt = Number(formData.pbAmt) || 0;
    const dcAmt = Number(formData.dcAmt) || 0;
    let tsb = 0;
    let cid = 0;

    if (formData.dc === 'Due' && formData.pb === 'COD') {
      tsb = pbAmt - dcAmt;
      cid = pbAmt;
    } else if (formData.dc === 'Prepaid' && formData.pb === 'COD') {
      tsb = pbAmt;
      cid = pbAmt;
    } else if (formData.dc === 'COD' && formData.pb === 'COD') {
      tsb = pbAmt;
      cid = pbAmt + dcAmt;
    } else if (formData.dc === 'Due' && formData.pb === 'Prepaid') {
      tsb = pbAmt - dcAmt;
      cid = 0;
    } else if (formData.dc === 'Prepaid' && formData.pb === 'Prepaid') {
      tsb = 0;
      cid = 0;
    } else if (formData.dc === 'COD' && formData.pb === 'Prepaid') {
      tsb = 0;
      cid = dcAmt;
    } else if (formData.dc === 'Due' && formData.pb === 'Due') {
      tsb = -pbAmt - dcAmt;
      cid = 0;
    }

    return { tsb, cid };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedVendor = vendors.find((vendor) => vendor.name === formData.vendor);

    const preparedFormData = {
      ...formData,
      vendor_email: selectedVendor?.email || '',
      pbAmt: formData.pbAmt ? Number(formData.pbAmt) : 0,
      dcAmt: formData.dcAmt ? Number(formData.dcAmt) : 0,
      tsb: calculateValues().tsb,
      cid: calculateValues().cid,
      type: 'pickupanddrop',
      status: 'pending',
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
        invoiceNumber:'',
        pbAmt: '',
        dcAmt: '',
        pickup: { name: '', address: '', phone: '' },
        drop: { name: '', address: '', phone: '' },
        orderType: '',
      });
      setUseVendorPickup(false);
      setUseVendorDrop(false);
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : err);
    }
  };

  const handleCellBlur = async (id: string, column: string, value: string) => {
    setEditingCell(null);

    const recordToUpdate = records.find((record) => record.id === id);

    if (recordToUpdate) {
      try {
        const { error } = await supabase
          .from('order_data')
          .update({ [column]: value })
          .eq('id', id);

        if (error) {
          console.error('Error updating record:', error.message);
        } else {
          setRecords((prev) =>
            prev.map((record) =>
              record.id === id ? { ...record, [column]: value } : record
            )
          );
        }
      } catch (err) {
        console.error('Unexpected error:', err instanceof Error ? err.message : err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading1}>Create New Record</h1>
      <RecordForm
        formData={formData}
        tsb={calculateValues().tsb}
        cid={calculateValues().cid}
        useVendorPickup={useVendorPickup}
        useVendorDrop={useVendorDrop}
        handleChange={(e) =>
          setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        }
        handleCheckboxChange={(e, type) =>
          type === 'pickup' ? setUseVendorPickup(e.target.checked) : setUseVendorDrop(e.target.checked)
        }
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
      <h2 className={styles.heading}>Latest 20 Records</h2>
      <EditableTable
        records={records}
        editingCell={editingCell}
        handleCellDoubleClick={(id, column) => setEditingCell({ id, column })}
        handleCellChange={(e, id, column) =>
          setRecords((prev) =>
            prev.map((record) =>
              record.id === id ? { ...record, [column]: e.target.value } : record
            )
          )
        }
        handleCellBlur={handleCellBlur}
      />
    </div>
  );
};

export default Page;
