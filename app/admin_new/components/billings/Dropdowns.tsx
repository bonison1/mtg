import React, { useEffect, useState } from 'react';
import styles from './crud.module.css';
import { supabase } from '../../../../lib/supabaseClient';

interface FormData {
  vendor: string;
  team: string;
  pb: string;
  dc: string;
}

interface DropdownsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdowns: React.FC<DropdownsProps> = ({ formData, handleChange }) => {
  const [vendors, setVendors] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    const fetchVendorsAndTeams = async () => {
      try {
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('users')
          .select('name')
          .eq('is_business_owner', true);

        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('team_name');

        if (vendorsError) throw vendorsError;
        if (teamsError) throw teamsError;

        setVendors(vendorsData?.map((vendor) => vendor.name) || []);
        setTeams(teamsData?.map((team) => team.team_name) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchVendorsAndTeams();
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
        <label>Bill Payment Reason:</label>
        <select name="pb" value={formData.pb} onChange={handleChange} className={styles.inputField}>
          <option value="">Select a reason</option>
          <option value="Bill Settlement">Bill Settlement</option>
          <option value="Delivery Charge Settlement">Delivery Charge Settlement</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Mode of Payment:</label>
        <select name="dc" value={formData.dc} onChange={handleChange} className={styles.inputField}>
          <option value="">Select a mode</option>
          <option value="Cash">Cash</option>
          <option value="Online">Online</option>
        </select>
      </div>
    </div>
  );
};

export default Dropdowns;
