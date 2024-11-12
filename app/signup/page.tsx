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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);  // State for preview URL
  const [statusMessage, setStatusMessage] = useState('');

  // Handle the file input change and generate the preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string); // Set the preview URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Prepare the user data payload
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
  
    // Insert user data into the 'users' table
    const { error: userError } = await supabase.from('users').insert([userPayload]);
  
    if (userError) {
      console.error('Signup error:', userError);
      setStatusMessage(`Error: ${userError.message}`);
      return;
    }
  
    setStatusMessage('Signup successful! You can now log in at the login page.');
  
    // Upload photo if provided and the user is a business owner
    if (photo && isBusinessOwner) {
      try {
        // Generate a unique filename for the photo
        const photoPath = `user_photos/user_pic/${email}_${photo.name}`;
        
        // Upload the photo to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(photoPath, photo);
  
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          setStatusMessage(`Error uploading photo: ${uploadError.message}`);
          return;
        }
  
        // Log the upload data to check if the file is uploaded successfully
        console.log('Upload Data:', uploadData);
  
        // Get the public URL of the uploaded photo
        const { data: { publicUrl } } = supabase
          .storage
          .from('user-photos')
          .getPublicUrl(photoPath);  // Accessing publicUrl inside the 'data' object
  
        console.log('Public URL:', publicUrl);  // Log the URL to verify it's correct
  
        // Ensure publicUrl is not null or undefined before proceeding
        if (!publicUrl) {
          console.error('Error: No public URL returned');
          setStatusMessage('Error retrieving the photo URL.');
          return;
        }
  
        // Update the user's photo URL in the database (in the 'photo' column)
        const { error: updateError } = await supabase
          .from('users')
          .update({ photo: publicUrl }) // Update photo URL
          .eq('email', email); // Ensure we're updating the correct user by email
  
        if (updateError) {
          console.error('Error updating photo URL:', updateError);
          setStatusMessage(`Error saving photo URL: ${updateError.message}`);
        } else {
          setStatusMessage('Photo uploaded and saved successfully!');
        }
  
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatusMessage('Unexpected error occurred while uploading photo.');
      }
    }
  
    resetFormFields();
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
    setPhotoPreviewUrl(null);  // Reset the preview
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
                <div className={styles.uploadContainer}>
                  {/* Photo preview on the left */}
                  {photoPreviewUrl && (
                    <div className={styles.photoPreview}>
                      <img
                        src={photoPreviewUrl}
                        alt="Photo Preview"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className={styles.inputField}
                    onChange={handleFileChange}
                  />
                </div>
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
