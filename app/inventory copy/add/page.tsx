'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem } from '../../../types/InventoryItem';
import './styles.css';

const AddItemPage = () => {
  const [item, setItem] = useState<InventoryItem>({
    id: 0, // Supabase will generate this
    name: '',
    description: '',
    quantity: 0,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const { isEmployeeLoggedIn, isLoggedIn } = useAuth(); // From AuthContext

  // Get the current logged-in user's ID and name
  const userId = isEmployeeLoggedIn || isLoggedIn ? 'current-user-id' : null; // Replace with your logic to get the user ID

  useEffect(() => {
    // Fetch the current user's name if logged in
    const fetchUserName = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('users')
          .select('name') // Assuming the 'users' table has a 'name' column
          .eq('user_id', userId) // Ensure we are using the correct column for user ID
          .single();

        if (data) {
          setUserName(data.name); // Store the name in state
        } else {
          console.error('Error fetching user name:', error?.message);
        }
      }
    };

    fetchUserName();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!item.name || item.quantity <= 0 || item.price <= 0) {
      alert('Please fill all required fields correctly');
      return;
    }

    if (!userId) {
      alert('You must be logged in to add an item.');
      return;
    }

    setLoading(true);

    try {
      // Insert the new item into the 'items' table with user_id and user_name
      const { data, error } = await supabase
        .from('items')
        .insert([{
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          user_id: userId, // Store the logged-in user's ID
          user_name: userName, // Store the logged-in user's name
        }]);

      if (error) {
        throw new Error(error.message); // Improved error handling
      }

      console.log('Item added:', data);
      router.push('/inventory'); // Redirect to the inventory list page
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding item:', error);
        alert(`Error adding item: ${error.message || 'Please try again'}`);
      } else {
        console.error('An unknown error occurred:', error);
        alert('An unknown error occurred, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const newValue = name === 'quantity' || name === 'price' ? 
      (value ? Number(value) : 0) : value;

    setItem(prevItem => ({
      ...prevItem,
      [name]: newValue,
    }));
  };

  return (
    <div className="add-item-container">
      <h1>Add New Item</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={item.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={item.description}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={item.quantity}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={item.price}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
};

export default AddItemPage;
