'use client';

import React, { useState, useEffect } from 'react';
import RecordForm from './RecordForm'; // Ensure correct import path
import { supabase } from '../../../../lib/supabaseClient';

const Page = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    team: '',
    pb: '',
    dc: '',
    pbAmt: '',
    dcAmt: '',
    pickup: { name: '', address: '', phone: '' },
    drop: { name: '', address: '', phone: '' },
    orderType: '',
    status: 'pending',
  });

  const [vendors, setVendors] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [tsb, setTsb] = useState(0);
  const [cid, setCid] = useState(0);

  const fetchDropdowns = async () => {
    try {
      const { data: vendorData } = await supabase.from('users').select('name');
      const { data: teamData } = await supabase.from('teams').select('team_name');

      setVendors(vendorData?.map((v) => v.name) || []);
      setTeams(teamData?.map((t) => t.team_name) || []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const generateOrderID = async () => {
    const { data } = await supabase.from('order_data').select('id').order('id', { ascending: false }).limit(1);
    const latestID = data?.[0]?.id || 0;
    setFormData((prev) => ({ ...prev, orderType: `ORD-${latestID + 1}` }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Explicitly type `keys` to help TypeScript recognize valid property names
    const keys = name.split('.') as [keyof typeof formData, string?];
  
    setFormData((prev) => {
      if (keys.length === 2) {
        const [section, key] = keys;
        return {
          ...prev,
          [section]: {
            ...(prev[section] as Record<string, string>),
            [key]: value,
          },
        };
      }
      return { ...prev, [keys[0]]: value };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await supabase.from('order_data').insert({ ...formData, tsb, cid });
    generateOrderID();
  };

  useEffect(() => {
    fetchDropdowns();
    generateOrderID();
  }, []);

  return (
    <div>
      <h1>Create Order</h1>
      <RecordForm
        formData={formData}
        tsb={tsb}
        cid={cid}
        vendors={vendors}
        teams={teams}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        generateOrderID={generateOrderID}
      />
    </div>
  );
};

export default Page;
