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
  const [statusMessage, setStatusMessage] = useState(''); // Use statusMessage here to display feedback

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
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Form fields */}
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
