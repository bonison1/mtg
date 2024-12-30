import React, { useEffect, useState } from 'react';
import styles from './crud.module.css'; // Make sure this path is correct
import { supabase } from '../../lib/supabaseClient';

interface form_data {
  vendor: string;
  team: string;
  pb: string;
  dc: string;
  pbAmt: string;
  dcAmt: string;
  orderType: string;
}

interface DropdownsProps {
  formData: form_data;  // Changed to match 'formData' instead of 'form_data'
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdowns_bill: React.FC<DropdownsProps> = ({ formData, handleChange }) => {
  const [vendors, setVendors] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  // Fetch vendors from the database
  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('is_business_owner', true);

      if (error) {
        console.error('Error fetching vendors:', error.message);
      } else if (data) {
        const vendorNames = data.map((vendor) => vendor.name);
        setVendors(vendorNames);
      }
    };

    const fetchTeams = async () => {
      const { data, error } = await supabase.from('teams').select('team_name');

      if (error) {
        console.error('Error fetching teams:', error.message);
      } else if (data) {
        const teamNames = data.map((team) => team.team_name);
        setTeams(teamNames);
      }
    };

    fetchVendors();
    fetchTeams();
  }, []);

  return (
    <div>
      <div className={styles.formGroup}>
        <label>PB:</label>
        <select name="pb" value={formData.pb} onChange={handleChange} className={styles.inputField}>
          <option value="">Select PB</option>
          <option value="Due">Due</option>
          <option value="Prepaid">Prepaid</option>
          <option value="COD">COD</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>DC:</label>
        <select name="dc" value={formData.dc} onChange={handleChange} className={styles.inputField}>
          <option value="">Select DC</option>
          <option value="Due">Due</option>
          <option value="Prepaid">Prepaid</option>
          <option value="COD">COD</option>
        </select>
      </div>
    </div>
  );
};

export default Dropdowns_bill;
