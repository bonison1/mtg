'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './Signup.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [category, setCategory] = useState<string>(''); // Single category selection
  const [otherCategory, setOtherCategory] = useState(''); // New state for the custom category input

  const router = useRouter();

  // Sample categories for the dropdown
  const availableCategories = ['Select One', 'Clothing', 'Bakery', 'Flower Shop', 'Finance', 'Retail', 'Hospitality', 'Education', 'Cafe', 'Hangout Spot', 'Service Sector', 'Others'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If the "Others" category is selected, add the custom category to the payload
    const selectedCategory = category === 'Others' && otherCategory.trim() ? otherCategory : category;

    // Check if the email is already registered
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError.message || emailCheckError);
    }

    if (existingUser && existingUser.length > 0) {
      setStatusMessage('Error: This email is already registered.');
      return; // Exit early if email is already registered
    }

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
      categories: selectedCategory ? [selectedCategory] : [], // Store only one category
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
        const { error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(photoPath, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          setStatusMessage(`Error uploading photo: ${uploadError.message}`);
          return;
        }

        // Get the public URL of the uploaded photo
        const { data: { publicUrl } } = supabase
          .storage
          .from('user-photos')
          .getPublicUrl(photoPath);

        if (!publicUrl) {
          console.error('Error: No public URL returned');
          setStatusMessage('Error retrieving the photo URL.');
          return;
        }

        // Update the user's photo URL in the database (in the 'photo' column)
        const { error: updateError } = await supabase
          .from('users')
          .update({ photo: publicUrl }) // Update photo URL
          .eq('email', email);

        if (updateError) {
          console.error('Error updating photo URL:', updateError);
          setStatusMessage(`Error saving photo URL: ${updateError.message}`);
        } else {
          setStatusMessage('Sign up successfully! You can now Login.');
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setStatusMessage('Unexpected error occurred while uploading photo.');
      }
    }

    // Redirect to login page after successful signup
    setTimeout(() => {
      router.push('/login');
      alert('Sign up successfully! You can now Login.');
    }, 2000);

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
    setPhotoPreviewUrl(null);
    setCategory('');
    setOtherCategory(''); // Reset custom category field
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    // If "Others" is selected, allow the user to input a custom category
    if (selectedCategory === 'Others') {
      setOtherCategory('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Personal Info Fields */}
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

        {/* Business Info Fields */}
        <div className={styles.formGroup}>
          <input
            type="checkbox"
            checked={isBusinessOwner}
            onChange={(e) => setIsBusinessOwner(e.target.checked)}
          />
          <label className={styles.label}>Are you a business owner?</label>
        </div>

        {isBusinessOwner && (
          <>
            {/* Business details form */}
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
              <label className={styles.label}>Categories:</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className={styles.inputField}
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {category === 'Others' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Enter Custom Category:</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  placeholder="Enter your category"
                />
              </div>
            )}

            {/* Business Photo Upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Upload your Business Profile Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {photoPreviewUrl && (
                <Image
                  src={photoPreviewUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  className={styles.previewImg}
                />
              )}
            </div>

            {/* Make Business Discoverable */}
            <div className={styles.formGroup}>
              <div>
                <input
                  type="checkbox"
                  checked={isRegistered}
                  onChange={(e) => setIsRegistered(e.target.checked)}
                />
                <label className={styles.label1}>
                  Make your business discoverable by users?
                </label>
              </div>
            </div>
          </>
        )}

        <button type="submit" className={styles.submitButton}>Sign Up</button>

        {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
      </form>
    </div>
  );
}
