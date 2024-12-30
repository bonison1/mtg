import React, { useState, useEffect } from 'react';
import styles from './crud.module.css';
import Dropdowns from './Dropdowns';
import Dropdowns_bill from './Dropdowns_bill';
import { supabase } from '../../lib/supabaseClient';

interface RecordFormProps {
  formData: {
    date: string;
    vendor: string;
    team: string;
    pb: string;
    dc: string;
    pickup: { name: string; address: string; phone: string };
    drop: { name: string; address: string; phone: string };
    dcAmt: string;
    pbAmt: string;
    orderType: string;
    invoiceNumber: string;
  };
  tsb: number;
  cid: number;
  useVendorPickup: boolean;
  useVendorDrop: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'pickup' | 'drop'
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<RecordFormProps['formData']>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Function to generate a 6-digit invoice number
const generateInvoiceNumber = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
  return `INV-${randomNum}`;
};

const RecordForm: React.FC<RecordFormProps> = ({
  formData,
  tsb,
  cid,
  useVendorPickup,
  useVendorDrop,
  handleChange,
  handleCheckboxChange,
  setFormData,
  handleSubmit,
}) => {
  useEffect(() => {
    // Initialize the invoice number if it's not already set
    if (!formData.invoiceNumber) {
      const initialInvoiceNumber = generateInvoiceNumber();
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: initialInvoiceNumber, // Set the generated invoice number in the form state
      }));
    }
  }, [formData.invoiceNumber, setFormData]);

  const fetchVendorDetails = async (type: 'pickup' | 'drop') => {
    if (!formData.vendor) {
      console.warn('Vendor is not selected');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, address, phone')
        .eq('name', formData.vendor)
        .limit(1);

      if (error) {
        console.error('Error fetching vendor data:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const vendor = data[0];

        if (type === 'pickup') {
          setFormData((prev) => ({
            ...prev,
            pickup: { name: vendor.name, address: vendor.address, phone: vendor.phone },
          }));
        } else if (type === 'drop') {
          setFormData((prev) => ({
            ...prev,
            drop: { name: vendor.name, address: vendor.address, phone: vendor.phone },
          }));
        }
      }
    } catch (err) {
      console.error('Error while fetching vendor details:', err);
    }
  };

  const handleVendorCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'pickup' | 'drop'
  ) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      fetchVendorDetails(type);
    } else {
      setFormData((prev) => ({
        ...prev,
        [type]: { name: '', address: '', phone: '' },
      }));
    }

    handleCheckboxChange(e, type);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Invoice Number Field */}
      <div>
        <label>Invoice Number:</label>
        <input
          type="text"
          name="invoiceNumber"
          value={formData.invoiceNumber || ''} // Ensure this is always a valid value (empty string if undefined)
          className={styles.inputField}
          readOnly
        />
      </div>

      {/* Date Field */}
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

      {/* Dropdowns */}
      <Dropdowns formData={formData} handleChange={handleChange} />

      {/* Pickup Section */}
      <div className={styles.section}>
        <h2 className={styles.heading2}>Pickup Details</h2>
        <div className={styles.formGroup}>
          <input
            type="checkbox"
            id="useVendorPickup"
            checked={useVendorPickup}
            onChange={(e) => handleVendorCheckboxChange(e, 'pickup')}
          />
          <label htmlFor="useVendorPickup" className="ml-2">
            Tick if the details are the same as the vendor
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="pickupName"
            value={formData.pickup.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, name: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorPickup}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address:</label>
          <input
            type="text"
            name="pickupAddress"
            value={formData.pickup.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, address: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorPickup}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone:</label>
          <input
            type="text"
            name="pickupPhone"
            value={formData.pickup.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pickup: { ...prev.pickup, phone: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorPickup}
          />
        </div>
      </div>

      {/* Drop Section */}
      <div className={styles.section}>
        <h2 className={styles.heading2}>Drop Details</h2>
        <div className={styles.formGroup}>
          <input
            type="checkbox"
            id="useVendorDrop"
            checked={useVendorDrop}
            onChange={(e) => handleVendorCheckboxChange(e, 'drop')}
          />
          <label htmlFor="useVendorDrop" className="ml-2">
            Tick if the details are the same as the vendor
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="dropName"
            value={formData.drop.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, name: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorDrop}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address:</label>
          <input
            type="text"
            name="dropAddress"
            value={formData.drop.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, address: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorDrop}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone:</label>
          <input
            type="text"
            name="dropPhone"
            value={formData.drop.phone}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                drop: { ...prev.drop, phone: e.target.value },
              }))
            }
            className={styles.inputField}
            readOnly={useVendorDrop}
          />
        </div>
      </div>

      {/* Billing Section */}
      <div className={styles.section}>
        <h2 className={styles.heading2}>Billing</h2>
        <Dropdowns_bill formData={formData} handleChange={handleChange} />
        <div className={styles.formGroup}>
          <label>DC Amount:</label>
          <input
            type="number"
            name="dcAmt"
            value={formData.dcAmt}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>PB Amount:</label>
          <input
            type="number"
            name="pbAmt"
            value={formData.pbAmt}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
      </div>

      {/* Auto Calculated Fields */}
      <div className={styles.section}>
        <h2 className={styles.heading2}>Auto Calculated</h2>
        <div className={styles.formGroup}>
          <label>TSB:</label>
          <input
            type="number"
            name="tsb"
            value={tsb}
            className={styles.inputField}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>CID:</label>
          <input
            type="number"
            name="cid"
            value={cid}
            className={styles.inputField}
            readOnly
          />
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
    </form>
  );
};

export default RecordForm;
