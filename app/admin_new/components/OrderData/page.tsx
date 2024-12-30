'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Order } from '../../../../types/order'; // Import the Order interface
import styles from '../../styles/OrderData.module.css';

export default function OrderDataPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: fetchedOrders, error: fetchError } = await supabase
          .from('order_data')
          .select('*');

        if (fetchError) throw new Error(fetchError.message);

        setOrders(fetchedOrders || []);
        setFilteredOrders(fetchedOrders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      setLoading(true);

      if (editingOrder) {
        const { error: updateError } = await supabase
          .from('order_data')
          .update(newOrder)
          .eq('id', editingOrder.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase.from('order_data').insert([newOrder]);

        if (insertError) throw new Error(insertError.message);
      }

      setEditingOrder(null);
      setNewOrder({});
      await refreshOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setNewOrder(order); // Populate the form fields with the selected order's data
  };

  const handleCancel = () => {
    setEditingOrder(null);
    setNewOrder({});
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase.from('order_data').delete().eq('id', id);

      if (deleteError) throw new Error(deleteError.message);

      await refreshOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      const { data: refreshedOrders, error } = await supabase.from('order_data').select('*');

      if (error) throw new Error(error.message);

      setOrders(refreshedOrders || []);
      setFilteredOrders(refreshedOrders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Order Data</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.form}>
        <h3>{editingOrder ? 'Edit Order' : 'Create Order'}</h3>

        <div className={styles.inputGroup}>
          <label>Vendor</label>
          <input
            type="text"
            placeholder="Vendor"
            value={newOrder.vendor || ''}
            onChange={(e) => setNewOrder({ ...newOrder, vendor: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Team</label>
          <input
            type="text"
            placeholder="Team"
            value={newOrder.team || ''}
            onChange={(e) => setNewOrder({ ...newOrder, team: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Pickup Name</label>
          <input
            type="text"
            placeholder="Pickup Name"
            value={newOrder.pickup_name || ''}
            onChange={(e) => setNewOrder({ ...newOrder, pickup_name: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Pickup Address</label>
          <input
            type="text"
            placeholder="Pickup Address"
            value={newOrder.pickup_address || ''}
            onChange={(e) => setNewOrder({ ...newOrder, pickup_address: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Pickup Phone</label>
          <input
            type="text"
            placeholder="Pickup Phone"
            value={newOrder.pickup_phone || ''}
            onChange={(e) => setNewOrder({ ...newOrder, pickup_phone: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Drop Name</label>
          <input
            type="text"
            placeholder="Drop Name"
            value={newOrder.drop_name || ''}
            onChange={(e) => setNewOrder({ ...newOrder, drop_name: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Drop Address</label>
          <input
            type="text"
            placeholder="Drop Address"
            value={newOrder.drop_address || ''}
            onChange={(e) => setNewOrder({ ...newOrder, drop_address: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Drop Phone</label>
          <input
            type="text"
            placeholder="Drop Phone"
            value={newOrder.drop_phone || ''}
            onChange={(e) => setNewOrder({ ...newOrder, drop_phone: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>PB Amount</label>
          <input
            type="number"
            placeholder="PB Amount"
            value={newOrder.pbAmt || ''}
            onChange={(e) => setNewOrder({ ...newOrder, pbAmt: Number(e.target.value) })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>DC Amount</label>
          <input
            type="number"
            placeholder="DC Amount"
            value={newOrder.dcAmt || ''}
            onChange={(e) => setNewOrder({ ...newOrder, dcAmt: Number(e.target.value) })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>TSB</label>
          <input
            type="text"
            placeholder="TSB"
            value={newOrder.tsb || ''}
            onChange={(e) => setNewOrder({ ...newOrder, tsb: e.target.value })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Status</label>
          <input
            type="text"
            placeholder="Status"
            value={newOrder.status || ''}
            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
          />
        </div>
        <button onClick={handleCreateOrUpdate}>
          {editingOrder ? 'Update' : 'Create'}
        </button>
        {editingOrder && <button onClick={handleCancel}>Cancel</button>}
      </div>

      <table className={styles.ordersTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vendor</th>
            <th>Team</th>
            <th>Pickup Details</th>
            <th>Drop Details</th>
            <th>PB Amount</th>
            <th>DC Amount</th>
            <th>TSB</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.vendor}</td>
              <td>{order.team}</td>
              <td>{`${order.pickup_name}, ${order.pickup_address}, ${order.pickup_phone}`}</td>
              <td>{`${order.drop_name}, ${order.drop_address}, ${order.drop_phone}`}</td>
              <td>{order.pbAmt}</td>
              <td>{order.dcAmt}</td>
              <td>{order.tsb}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => handleEdit(order)}>Edit</button>
                <button onClick={() => handleDelete(order.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
