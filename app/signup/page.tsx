'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './Signup.module.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [productService, setProductService] = useState('');
  const [businessExperience, setBusinessExperience] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userPayload = {
      name,
      email,
      password,
      address,
      phone,
      is_business_owner: isBusinessOwner,
      business_name: isBusinessOwner ? businessName : null,
      business_address: isBusinessOwner ? businessAddress : null,
      business_type: isBusinessOwner ? businessType : null,
      product_service: isBusinessOwner ? productService : null,
      business_experience: isBusinessOwner ? businessExperience : null,
      business_description: isBusinessOwner ? businessDescription : null,
      is_registered: isBusinessOwner ? isRegistered : null,
    };

    // Insert the user data into the Supabase users table
    const { data, error } = await supabase.from('users').insert([userPayload]);

    if (error) {
      console.error('Signup error:', error);
      setStatusMessage(`Error: ${error.message}`);
    } else {
      setStatusMessage('Signup successful! You can now log in.');
      resetFormFields();
    }
  };

  const resetFormFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAddress('');
    setPhone('');
    setIsBusinessOwner(false);
    setBusinessName('');
    setBusinessAddress('');
    setBusinessType('');
    setProductService('');
    setBusinessExperience('');
    setBusinessDescription('');
    setIsRegistered(false);
    setPhoto(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Name:</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Email:</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Password:</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Address:</label>
            <input
              type="text"
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel}>Phone:</label>
            <input
              type="text"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isBusinessOwner}
              onChange={(e) => setIsBusinessOwner(e.target.checked)}
            />
            <label>Sign up as a business owner</label>
          </div>

          {isBusinessOwner && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Business Name:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Business Address:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Business Type:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Product/Service:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={productService}
                  onChange={(e) => setProductService(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Business Experience:</label>
                <textarea
                  className={styles.input}
                  value={businessExperience}
                  onChange={(e) => setBusinessExperience(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Business Description:</label>
                <textarea
                  className={styles.input}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isRegistered}
                  onChange={(e) => setIsRegistered(e.target.checked)}
                />
                <label>Is your business registered legally?</label>
              </div>

              {/* Photo Upload for Business Owners */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Upload Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={handlePhotoChange}
                />
              </div>
            </>
          )}

          <button type="submit" className={styles.button}>
            Sign Up
          </button>
          {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
        </form>
      </div>
      <Footer />
    </div>
  );
}
