// app/signup/page.tsx

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

    const { error } = await supabase.from('users').insert([userPayload]);

    if (error) {
      console.error('Signup error:', error);
      setStatusMessage(`Error: ${error.message}`);
    } else {
      setStatusMessage('Signup successful! You can now log in at the login page.');
      if (photo && isBusinessOwner) {
        const { data, error } = await supabase.storage
        .from('user-photos')  // Ensure 'user-photos' exists in Supabase
        .upload(`business_owners/${email}_${photo.name}`, photo);
                
      if (error) {
        console.error('Photo upload error:', error);
        setStatusMessage(`Error uploading photo: ${error.message}`);
      } else {
        console.log('Upload data:', data);  // Log or process the upload response
        setStatusMessage('Photo uploaded successfully!');
      }
      

      }
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

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name:</label>
            <input
              type="text"
              className={styles.inputField}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password:</label>
            <input
              type="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Address:</label>
            <input
              type="text"
              className={styles.inputField}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone:</label>
            <input
              type="tel"
              className={styles.inputField}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Are you a Business Owner?</label>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={isBusinessOwner}
              onChange={() => setIsBusinessOwner(!isBusinessOwner)}
            />
          </div>

          {isBusinessOwner && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Name:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Address:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Type:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Product/Service:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={productService}
                  onChange={(e) => setProductService(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Experience:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={businessExperience}
                  onChange={(e) => setBusinessExperience(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Description:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Is the business registered?</label>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isRegistered}
                  onChange={() => setIsRegistered(!isRegistered)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Upload Photo:</label>
                <input
                  type="file"
                  className={styles.inputField}
                  onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
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
