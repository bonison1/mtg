'use client';  // Add this line at the top of the file

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client
import styles from '../inventory/AddItem.module.css'; // Import the CSS module

interface Item {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  user_id: string;
  user_name: string;
  created_at: string;
}

interface User {
  user_id: string;
  user_name: string;
}

const AddItem = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]); // To store user's items
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // Updated to type Item

  // Fetch user's items on page load
  const fetchItems = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user: User = JSON.parse(userJson); // Use the User type
    const user_id = user.user_id;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user_id); // Fetch items that match the user's user_id

    if (error) {
      console.error('Error fetching items:', error.message);
    } else {
      setItems(data);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle item addition
  const handleAddItem = async () => {
    setLoading(true);
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      alert('User not logged in');
      setLoading(false);
      return;
    }

    const user: User = JSON.parse(userJson); // Use the User type
    const user_id = user.user_id;
    const user_name = user.user_name;

    // Insert item into the "items" table, associating with the logged-in user
    const { error } = await supabase
      .from('items')
      .insert([
        {
          name,
          description: description || null,
          quantity,
          price,
          user_id,
          user_name,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error inserting item:', error.message);
      alert('Error adding item');
      setLoading(false);
      return;
    }

    // Refresh the items after adding a new one
    fetchItems();
    setLoading(false);
    alert('Item added successfully!');
    setName('');
    setDescription('');
    setQuantity(1);
    setPrice(0);
  };

  // Handle editing an item
  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsEditing(true);
  };

  // Handle saving the edited item
  const handleSaveItem = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('items')
      .update({
        name: selectedItem.name,
        description: selectedItem.description,
        quantity: selectedItem.quantity,
        price: selectedItem.price,
      })
      .eq('id', selectedItem.id); // Update item based on its id

    if (error) {
      console.error('Error updating item:', error.message);
      alert('Error saving changes');
      return;
    }

    // Refresh items after saving changes
    fetchItems();
    setIsEditing(false);
    alert('Item updated successfully!');
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedItem(null);
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId); // Delete item by its ID

      if (error) {
        console.error('Error deleting item:', error.message);
        alert('Error deleting item');
        return;
      }

      // Refresh the items after deletion
      fetchItems();
      alert('Item deleted successfully!');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Add New Item</h1>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Quantity</label>
          <input
            type="number"
            className={styles.input}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className={styles.label}>Price</label>
          <input
            type="number"
            className={styles.input}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>

      {/* Editable Item Table */}
      <div className={styles.editItemContainer}>
        <h3 className={styles.h3}>Your Items</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>
                  <button
                    className={styles.button}
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Item Modal */}
      {isEditing && selectedItem && (
        <div className={styles.editItemContainer}>
          <h3 className={styles.h3}>Edit Item</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                className={styles.input}
                value={selectedItem.name}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={selectedItem.description || ''}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className={styles.label}>Quantity</label>
              <input
                type="number"
                className={styles.input}
                value={selectedItem.quantity}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className={styles.label}>Price</label>
              <input
                type="number"
                className={styles.input}
                value={selectedItem.price}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleSaveItem}
                className={styles.button}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className={`${styles.button} ${styles.cancelButton}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddItem;
