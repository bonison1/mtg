// crud/Dropdowns.tsx
import React, { useEffect, useState } from 'react';
import styles from './crud.module.css'; // Make sure this path is correct
import { supabase } from '../../lib/supabaseClient';

interface FormData {
  vendor: string;
  team: string;
  pb: string;
  dc: string;
  pbAmt: string;
  dcAmt: string;
  orderType: string;
}

interface DropdownsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdowns: React.FC<DropdownsProps> = ({ formData, handleChange }) => {
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
        <label>Vendor:</label>
        <select name="vendor" value={formData.vendor} onChange={handleChange} className={styles.inputField}>
          <option value="">Select a vendor</option>
          {vendors.map((vendor, index) => (
            <option key={index} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Team:</label>
        <select name="team" value={formData.team} onChange={handleChange} className={styles.inputField}>
          <option value="">Select a team</option>
          {teams.map((team, index) => (
            <option key={index} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Order Type:</label>
        <select name="orderType" value={formData.orderType} onChange={handleChange} className={styles.inputField}>
          <option value="">Select type</option>
          <option value="Instant">Instant</option>
          <option value="Standard">Standard</option>
        </select>
      </div>
              
    </div>
  );
};

export default Dropdowns;
