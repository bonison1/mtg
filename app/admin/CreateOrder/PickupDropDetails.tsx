import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface PickupDropDetailsProps {
  type: 'pickup' | 'drop';
  vendorName: string; // Vendor name from parent
  useVendor: boolean;
  handleDetailsChange: (field: string, value: string, type: 'pickup' | 'drop') => void;
}

const PickupDropDetails: React.FC<PickupDropDetailsProps> = ({
  type,
  vendorName,
  useVendor,
  handleDetailsChange,
}) => {
  const [details, setDetails] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    if (useVendor && vendorName) {
      const fetchVendorData = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('name, address, phone')
            .eq('name', vendorName)
            .single();

          if (error) {
            console.error(`Error fetching vendor data for ${type}:`, error.message);
            return;
          }

          if (data) {
            setDetails(data); // Update local state to avoid repeated calls
            handleDetailsChange('name', data.name, type);
            handleDetailsChange('address', data.address, type);
            handleDetailsChange('phone', data.phone, type);
          }
        } catch (err) {
          console.error(`Unexpected error fetching vendor data for ${type}:`, err);
        }
      };

      fetchVendorData();
    } else {
      setDetails({ name: '', address: '', phone: '' });
      handleDetailsChange('name', '', type);
      handleDetailsChange('address', '', type);
      handleDetailsChange('phone', '', type);
    }
    // Only run when `useVendor` or `vendorName` changes
  }, [useVendor, vendorName, type, handleDetailsChange]);

  return (
    <div style={{ flex: '1', marginBottom: '20px' }}>
      <h3>{type === 'pickup' ? 'Pickup Details' : 'Drop Details'}</h3>
      <label>
        <input
          type="checkbox"
          checked={useVendor}
          onChange={(e) =>
            handleDetailsChange('useVendor', e.target.checked ? 'true' : 'false', type)
          }
        />
        Use vendor details for {type}
      </label>
      <label>Name:</label>
      <input
        type="text"
        value={details.name}
        readOnly={useVendor}
        onChange={(e) => handleDetailsChange('name', e.target.value, type)}
      />
      <label>Address:</label>
      <input
        type="text"
        value={details.address}
        readOnly={useVendor}
        onChange={(e) => handleDetailsChange('address', e.target.value, type)}
      />
      <label>Phone:</label>
      <input
        type="text"
        value={details.phone}
        readOnly={useVendor}
        onChange={(e) => handleDetailsChange('phone', e.target.value, type)}
      />
    </div>
  );
};

export default PickupDropDetails;
