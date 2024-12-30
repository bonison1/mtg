import React, { useEffect } from 'react';
import Dropdown from './Dropdowns'; // Correct import path for Dropdown component
import styles from './crud.module.css';

export interface RecordFormProps {
  formData: {
    date: string;
    vendor: string;
    team: string;
    pb: string;
    dc: string;
    pbAmt: string;
    dcAmt: string;
    pickup: { name: string; address: string; phone: string };
    drop: { name: string; address: string; phone: string };
    orderType: string;
    status: string;
  };
  tsb: number;
  cid: number;
  vendors: string[];
  teams: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  generateOrderID: () => Promise<void>;
}

const RecordForm: React.FC<RecordFormProps> = ({
  formData,
  tsb,
  cid,
  vendors,
  teams,
  handleChange,
  handleSubmit,
  generateOrderID,
}) => {
  useEffect(() => {
    generateOrderID();
  }, [generateOrderID]);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Date and Order ID Section */}
      <div className={styles.formTable}>
        <div className={styles.tableHeader}>Date and Order ID</div>
        <div className={`${styles.cell} ${styles.label}`}>Date</div>
        <div className={`${styles.cell} ${styles.input}`}>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={`${styles.cell} ${styles.label}`}>Order ID</div>
        <div className={`${styles.cell} ${styles.input}`}>
          <input
            type="text"
            name="orderType"
            value={formData.orderType}
            readOnly
            className={styles.inputField}
          />
        </div>
      </div>

      {/* Dropdowns */}
      <div className={styles.formTable}>
        <Dropdown
          label="Vendor"
          name="vendor"
          value={formData.vendor}
          options={vendors}
          onChange={handleChange}
        />
        <Dropdown
          label="Team"
          name="team"
          value={formData.team}
          options={teams}
          onChange={handleChange}
        />
        <Dropdown
          label="PB"
          name="pb"
          value={formData.pb}
          options={['COD', 'Prepaid', 'Due']}
          onChange={handleChange}
        />
        <Dropdown
          label="DC"
          name="dc"
          value={formData.dc}
          options={['COD', 'Prepaid', 'Due']}
          onChange={handleChange}
        />
      </div>

      {/* Billing Details */}
      <div className={styles.formTable}>
        <div className={styles.tableHeader}>Billing Details</div>
        <div className={`${styles.cell} ${styles.label}`}>PB Amount</div>
        <div className={`${styles.cell} ${styles.input}`}>
          <input
            type="number"
            name="pbAmt"
            value={formData.pbAmt}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={`${styles.cell} ${styles.label}`}>DC Amount</div>
        <div className={`${styles.cell} ${styles.input}`}>
          <input
            type="number"
            name="dcAmt"
            value={formData.dcAmt}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
