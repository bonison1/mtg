'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../send-message/[user_id]/sender-message.module.css';

type User = {
  user_id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
};

export default function SendMessage() {
  const { user_id } = useParams(); // Get user_id from the URL
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [senderEmail, setSenderEmail] = useState<string>(''); // To store sender's email
  
  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string>(''); // To store recipient's email
  const [orderId, setOrderId] = useState<string | null>(null); // To store the generated order ID
  const [useMyInfo, setUseMyInfo] = useState(false); // To track checkbox state
  const [errorMessage, setErrorMessage] = useState<string>(''); // To store error messages if any

  useEffect(() => {
    if (!user_id) return;

    const fetchUserDetails = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('users') // Fetch user data from 'users' table
        .select('user_id, name, email, address, phone') // Fetch additional user details
        .eq('user_id', user_id)
        .single();

      if (error) {
        console.error('Error fetching user details:', error.message);
      } else {
        setUser(data);
        setUserEmail(data.email); // Store the recipient's email
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, [user_id]);

  // Check sessionStorage for logged-in user data
  useEffect(() => {
    const loggedInUser = sessionStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setSenderEmail(parsedUser.email); // Store sender's email
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Helper function to generate a random ID starting with 'M'
  const generateRandomId = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generates a six-digit number
    return `M${randomNumber}`;
  };

  // Handle checkbox change to autofill data
  const handleCheckboxChange = () => {
    setUseMyInfo((prev) => {
      const newValue = !prev;
      if (newValue && user) {
        setName(user.name || '');
        setAddress(user.address || '');
        setMobileNumber(user.phone || '');
      } else {
        setName('');
        setAddress('');
        setMobileNumber('');
      }
      return newValue;
    });
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form fields
    if (!name || !address || !mobileNumber || !message) {
      alert('Please fill in all fields');
      return;
    }

    const generatedOrderId = generateRandomId(); // Generate a random order ID

    // Insert message data into the database
    const { data: insertData, error: insertError } = await supabase
      .from('message_data')
      .insert([
        {
          user_id, // Recipient's user_id
          name,
          address,
          mobile_number: mobileNumber,
          message,
          email: userEmail, // Store recipient's email
          sender_email: senderEmail, // Store sender's email
          order_id: generatedOrderId, // Store the generated order ID
          status: 'pending', // Default status when the message is inserted
        },
      ])
      .single(); // We expect a single inserted row

    if (insertError) {
      console.error('Error inserting message:', insertError.message);
      alert('There was an error sending the message.');
      setErrorMessage(insertError.message); // Show the error to the user
      return;
    }

    // Set the generated order ID to show it on the UI
    setOrderId(generatedOrderId);

    // Optionally, update the message record (e.g., mark as sent)
    const { error: updateError } = await supabase
      .from('message_data')
      .update({
        status: 'sent',  // Update status to 'sent'
        sent_at: new Date().toISOString(),  // Add sent_at with current timestamp
      })
      .eq('order_id', generatedOrderId);  // Use the generated order_id to update the correct record

    if (updateError) {
      console.error('Error updating message status:', updateError.message);
      alert('There was an error updating the message status.');
      return;
    }

    alert('Message sent successfully!');

    // Redirect to the order confirmation page, passing the orderId as a query parameter
    router.push(`/order-confirmation?orderId=${generatedOrderId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Send Message to {user.name}</h1>
      <p>Email: {user.email}</p>

      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>} {/* Display error message */}

      <form onSubmit={handleSubmit} className={styles.messageForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your address"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Your mobile number"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here"
            required
          />
        </div>


        <button type="submit" className={styles.sendButton}>
          Send Message
        </button>
      </form>

      {/* Show the order ID after the message is sent */}
      {orderId && (
        <div className={styles.orderIdContainer}>
          <h2>Your Order ID is: {orderId}</h2>
        </div>
      )}
    </div>
  );
}
