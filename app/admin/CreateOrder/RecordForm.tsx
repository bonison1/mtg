import React, { useState, useEffect } from 'react';
import styles from '../styles/RecordForm.module.css';
import Dropdowns from './Dropdowns';
import Dropdowns_bill from './Dropdowns_bill';
import { supabase } from '../../../lib/supabaseClient';

interface Vendor {
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface RecordFormProps {
  vendors: Vendor[];
  onSubmitSuccess: () => void; // Callback to refresh records after submission
}

const RecordForm: React.FC<RecordFormProps> = ({ vendors, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    team: '',
    pb: '',
    dc: '',
    pbAmt: '',
    dcAmt: '',
    inv: '',
    pickup: { name: '', address: '', phone: '' },
    drop: { name: '', address: '', phone: '' },
    orderType: '',
  });

  const [useVendorPickup, setUseVendorPickup] = useState(false);
  const [useVendorDrop, setUseVendorDrop] = useState(false);

  useEffect(() => {
    if (!formData.inv) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      setFormData((prev) => ({ ...prev, inv: `INV-${randomNum}` }));
    }
  }, [formData.inv]);

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

  const handleVendorCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'pickup' | 'drop'
  ) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      const selectedVendor = vendors.find((vendor) => vendor.name === formData.vendor);
      if (selectedVendor) {
        const updatedDetails = {
          name: selectedVendor.name,
          address: selectedVendor.address,
          phone: selectedVendor.phone,
        };
        if (type === 'pickup') {
          setFormData((prev) => ({ ...prev, pickup: updatedDetails }));
        } else if (type === 'drop') {
          setFormData((prev) => ({ ...prev, drop: updatedDetails }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [type]: { name: '', address: '', phone: '' },
      }));
    }

    if (type === 'pickup') {
      setUseVendorPickup(isChecked);
    } else {
      setUseVendorDrop(isChecked);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedVendor = vendors.find((vendor) => vendor.name === formData.vendor);

    if (!selectedVendor || !selectedVendor.email) {
      console.error('Error: Vendor email is missing or invalid.');
      return;
    }

    const preparedFormData = {
      ...formData,
      vendor_email: selectedVendor.email,
      pbAmt: Number(formData.pbAmt) || 0,
      dcAmt: Number(formData.dcAmt) || 0,
      tsb: calculateValues().tsb,
      cid: calculateValues().cid,
      type: 'pickupanddrop',
      status: 'pending',
    };

    try {
      const { error } = await supabase.from('order_data').insert([preparedFormData]);
      if (error) throw new Error(error.message);

      setFormData({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        team: '',
        pb: '',
        dc: '',
        pbAmt: '',
        dcAmt: '',
        inv: '',
        pickup: { name: '', address: '', phone: '' },
        drop: { name: '', address: '', phone: '' },
        orderType: '',
      });
      setUseVendorPickup(false);
      setUseVendorDrop(false);

      onSubmitSuccess();
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.section}>
        <h2>Invoice Details</h2>
        <div>
        <div>
          <label>Invoice Number:</label>
          <input type="text" value={formData.inv} readOnly />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
          />
        </div>
        </div>
        <Dropdowns
          formData={formData}
          handleChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
        />
      </div>
<div className={styles.section}>
      <div>
        <h2>Pickup Details</h2>
        <div>
          <input
            type="checkbox"
            checked={useVendorPickup}
            onChange={(e) => handleVendorCheckboxChange(e, 'pickup')}
          />
          <label>Use vendor details for pickup</label>
        </div>
        <div>
          <label>Pickup Name:</label>
          <input
            type="text"
            value={formData.pickup.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, name: e.target.value },
              }))
            }
            readOnly={useVendorPickup}
          />
        </div>
        <div>
          <label>Pickup Address:</label>
          <input
            type="text"
            value={formData.pickup.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, address: e.target.value },
              }))
            }
            readOnly={useVendorPickup}
          />
        </div>
        <div>
          <label>Pickup Phone:</label>
          <input
            type="text"
            value={formData.pickup.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, phone: e.target.value },
              }))
            }
            readOnly={useVendorPickup}
          />
        </div>
      </div>

      <div>
        <h2>Drop Details</h2>
        <div>
          <input
            type="checkbox"
            checked={useVendorDrop}
            onChange={(e) => handleVendorCheckboxChange(e, 'drop')}
          />
          <label>Use vendor details for drop</label>
        </div>
        <div>
          <label>Drop Name:</label>
          <input
            type="text"
            value={formData.drop.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, name: e.target.value },
              }))
            }
            readOnly={useVendorDrop}
          />
        </div>
        <div>
          <label>Drop Address:</label>
          <input
            type="text"
            value={formData.drop.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, address: e.target.value },
              }))
            }
            readOnly={useVendorDrop}
          />
        </div>
        <div>
          <label>Drop Phone:</label>
          <input
            type="text"
            value={formData.drop.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, phone: e.target.value },
              }))
            }
            readOnly={useVendorDrop}
          />
        </div>
      </div>
      </div>
      <div className={styles.section}>
        <h2>Billing</h2>
        <Dropdowns_bill
          formData={formData}
          handleChange={(e) =>
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
          }
        />
        <div>
        <div>
          <label>PB Amount:</label>
          <input
            type="number"
            name="pbAmt"
            value={formData.pbAmt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pbAmt: e.target.value }))
            }
          />
        </div>
        <div>
          <label>DC Amount:</label>
          <input
            type="number"
            name="dcAmt"
            value={formData.dcAmt}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dcAmt: e.target.value }))
            }
          />
        </div>
        </div>

        <div>
          <label>TSB:</label>
          <input type="number" value={calculateValues().tsb} readOnly />
        </div>
        <div>
          <label>CID:</label>
          <input type="number" value={calculateValues().cid} readOnly />
        </div>
      </div>


      <button type="submit">Submit</button>
    </form>
  );
};

export default RecordForm;
