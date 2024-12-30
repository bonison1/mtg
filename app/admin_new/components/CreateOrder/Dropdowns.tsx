import React from 'react';
import styles from './crud.module.css';

interface DropdownsProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Dropdown: React.FC<DropdownsProps> = ({ label, name, value, options, onChange }) => {
  return (
    <div className={styles.dropdownContainer}>
      <label className={styles.dropdownLabel}>{label}</label>
      <select name={name} value={value} onChange={onChange} className={styles.dropdown}>
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
