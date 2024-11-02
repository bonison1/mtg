"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './OrderPage.module.css'; // Import the CSS module
import Header from '../components/GlobalHeader.module.css';

type OrderData = {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  date: string;
  team: string;
  pickup_name: string;
  pickup_address: string;
  pickup_phone: string;
  drop_name: string;
  drop_address: string;
  drop_phone: string;
  order_type: string;
  pb: string;
  dc: string;
  pb_amount: number;
  dc_amount: number;
  auto_tsb: number;
  auto_cid: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Partial<OrderData> | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('order_data').select('*');
    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('order_data').delete().eq('id', id);
    if (error) console.error('Error deleting order:', error);
    else fetchOrders(); // Refresh orders after delete
  };

  const handleUpdateClick = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedOrder && selectedOrder.id) {
      const { error } = await supabase
        .from('order_data')
        .update({
          name: selectedOrder.name,
          team: selectedOrder.team,
          pickup_name: selectedOrder.pickup_name,
          pickup_address: selectedOrder.pickup_address,
          pickup_phone: selectedOrder.pickup_phone,
          drop_name: selectedOrder.drop_name,
          drop_address: selectedOrder.drop_address,
          drop_phone: selectedOrder.drop_phone,
          order_type: selectedOrder.order_type,
          pb: selectedOrder.pb,
          dc: selectedOrder.dc,
          pb_amount: selectedOrder.pb_amount,
          dc_amount: selectedOrder.dc_amount,
          auto_tsb: selectedOrder.auto_tsb,
          auto_cid: selectedOrder.auto_cid,
          status: selectedOrder.status,
        })
        .eq('id', selectedOrder.id);

      if (error) {
        console.error('Error updating order:', error);
      } else {
        fetchOrders(); // Refresh orders after update
        setIsModalOpen(false); // Close modal
      }
    }
  };

  return (
    <div>
      <h1>Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Pickup Details</th>
              <th>Drop Details</th>
              <th>Order Type</th>
              <th>PB</th>
              <th>DC</th>
              <th>PB Amount</th>
              <th>DC Amount</th>
              <th>TSB</th>
              <th>CID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.name}</td>
                <td>{order.team}</td>
                <td>{`${order.pickup_name}, ${order.pickup_address}, ${order.pickup_phone}`}</td>
                <td>{`${order.drop_name}, ${order.drop_address}, ${order.drop_phone}`}</td>
                <td>{order.order_type}</td>
                <td>{order.pb}</td>
                <td>{order.dc}</td>
                <td>{order.pb_amount}</td>
                <td>{order.dc_amount}</td>
                <td>{order.auto_tsb}</td>
                <td>{order.auto_cid}</td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => handleUpdateClick(order)}>Update</button>
                  <button onClick={() => handleDelete(order.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Order</h2>
            <label>
              Name:
              <input
                type="text"
                value={selectedOrder.name || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, name: e.target.value })}
              />
            </label>
            <label>
              Team:
              <input
                type="text"
                value={selectedOrder.team || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, team: e.target.value })}
              />
            </label>
            <label>
              Pickup Name:
              <input
                type="text"
                value={selectedOrder.pickup_name || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, pickup_name: e.target.value })}
              />
            </label>
            {/* Add more fields as necessary */}
            <label>
              Status:
              <select
                value={selectedOrder.status || ''}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value={`Delivered ${new Date().toLocaleDateString()}`}>
                  Delivered {new Date().toLocaleDateString()}
                </option>
                <option value={`Out for Delivery ${new Date().toLocaleDateString()}`}>
                  Out for Delivery {new Date().toLocaleDateString()}
                </option>
                <option value="Returned">Returned</option>
                <option value="Canceled by Customer">Canceled by Customer</option>
                <option value="Failed">Failed</option>
                <option value="Pre Order">Pre Order</option>
              </select>
            </label>
            <div className={styles.modalActions}>
              <button onClick={handleUpdate}>Save Changes</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
