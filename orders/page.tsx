'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './OrderPage.module.css';

type OrderData = {
  id: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [nameFilter, setNameFilter] = useState('');
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set()); // Track selected orders
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
  const [newStatus, setNewStatus] = useState('Pending'); // New status for bulk update
  const [teamOptions, setTeamOptions] = useState<string[]>([]); // State for team options
  const [vendorOptions, setVendorOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
    fetchTeamOptions(); // Fetch team options on mount
    fetchVendorOptions();
  }, [statusFilter, searchQuery, teamFilter, nameFilter]);



  const fetchOrders = async () => {
    const { data, error } = await supabase.from('order_data').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
      setLoading(false);

      // Calculate the status counts
      const counts: { [key: string]: number } = {};
      data?.forEach((order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
      });
      setStatusCounts(counts);
    }
  };
  const fetchTeamOptions = async () => {
    const { data, error } = await supabase.from('team_users').select('username');
    if (error) {
      console.error('Error fetching team options:', error);
    } else {
      setTeamOptions(data?.map((item) => item.username) || []);
    }
  };


  const fetchVendorOptions = async () => {
    const { data, error } = await supabase.from('users').select('name');
    if (error) {
      console.error('Error fetching team options:', error);
    } else {
      setVendorOptions(data?.map((item) => item.name) || []);
    }
  };



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = async (id: number, status: string) => {
    const { error } = await supabase
      .from('order_data')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchOrders(); // Refresh the orders after update
    }
  };
  const handlePBChange = async (id: number, pb: string) => {
    const { error } = await supabase
      .from('order_data')
      .update({ pb })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchOrders(); // Refresh the orders after update
    }
  };
  const handleDCChange = async (id: number, dc: string) => {
    const { error } = await supabase
      .from('order_data')
      .update({ dc })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchOrders(); // Refresh the orders after update
    }
  };
  const handleTeamChange = async (id: number, team: string) => {
    const { error } = await supabase
      .from('order_data')
      .update({ team })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchOrders(); // Refresh the orders after update
    }
  };

  const handleBulkStatusUpdate = async () => {
    const selectedOrderIds = Array.from(selectedOrders);

    const { error } = await supabase
      .from('order_data')
      .update({ status: newStatus })
      .in('id', selectedOrderIds);

    if (error) {
      console.error('Error updating selected orders:', error);
    } else {
      fetchOrders(); // Refresh the orders after bulk update
      setSelectedOrders(new Set()); // Clear selection after bulk update
    }
  };


  const handleSelectOrder = (id: number) => {
    const updatedSelection = new Set(selectedOrders);
    if (updatedSelection.has(id)) {
      updatedSelection.delete(id);
    } else {
      updatedSelection.add(id);
    }
    setSelectedOrders(updatedSelection);
  };

  const handleDropdownChange = async (id: number, field: string, value: any) => {
    const { error } = await supabase
      .from('order_data')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      console.error(`Error updating ${field}:`, error);
    } else {
      fetchOrders(); // Refresh the orders after update
    }
  };

  const filteredOrders = orders.filter((order) => {
    const queryMatch = Object.values(order)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const statusMatch =
      statusFilter === 'All' || order.status === statusFilter;
    const teamMatch = teamFilter === 'All' || order.team === teamFilter;
    const nameMatch = order.name.toLowerCase().includes(nameFilter.toLowerCase());

    return queryMatch && statusMatch && teamMatch && nameMatch;
  });

  return (
    <div className={styles.orderPage}>
      <h1>Orders</h1>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      {/* Status Counts Display */}
      <div className={styles.statusCounts}>
        <h2>Status Counts:</h2>
        <ul>
          {Object.keys(statusCounts).map((status) => (
            <li key={status}>
              {status}: {statusCounts[status]}
            </li>
          ))}
        </ul>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterInput}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Returned">Returned</option>
          <option value="Canceled by Customer">Canceled by Customer</option>
          <option value="Failed">Failed</option>
          <option value="Pre Order">Pre Order</option>
        </select>

        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className={styles.filterInput}
        >
          <option value="All">All Teams</option>
          {Array.from(new Set(orders.map((order) => order.team))).map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <select
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className={styles.filterInput}
        >
          <option value="All">All Vendors</option>
          {Array.from(new Set(orders.map((order) => order.name))).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk Action */}
      <div className={styles.bulkActionContainer}>
        <button
          onClick={handleBulkStatusUpdate}
          disabled={selectedOrders.size === 0}
          className={styles.bulkActionButton}
        >
          Update Status to "{newStatus}"
        </button>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className={styles.statusDropdown}
        >
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Returned">Returned</option>
          <option value="Canceled by Customer">Canceled by Customer</option>
          <option value="Failed">Failed</option>
          <option value="Pre Order">Pre Order</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                {/* Add a checkbox to select all */}
                <input
                  type="checkbox"
                  onChange={() => {
                    if (selectedOrders.size === filteredOrders.length) {
                      setSelectedOrders(new Set());
                    } else {
                      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
                    }
                  }}
                  checked={selectedOrders.size === filteredOrders.length}
                />
              </th>
              <th>Vendor</th>
              <th>Date</th>
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
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                  />
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-name`]: true }))}>
                  {isEditing[`${order.id}-name`] ? (
                    <input
                      type="text"
                      defaultValue={order.name}
                      onBlur={(e) => handleDropdownChange(order.id, 'name', e.target.value)}
                    />
                  ) : (
                    order.name
                  )}
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-date`]: true }))}>
                  {isEditing[`${order.id}-date`] ? (
                    <input
                      type="text"
                      defaultValue={order.date}
                      onBlur={(e) => handleDropdownChange(order.id, 'date', e.target.value)}
                    />
                  ) : (
                    order.date
                  )}
                </td>

                <td>
                  <select
                    value={order.team}
                    onChange={(e) => handleTeamChange(order.id, e.target.value)}
                  >
                    {teamOptions.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                  </select>
                </td>

                

                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-pickup_name`]: true }))}>
                  {isEditing[`${order.id}-pickup_name`] ? (
                    <input
                      type="text"
                      defaultValue={order.pickup_name}
                      onBlur={(e) => handleDropdownChange(order.id, 'pickup_name', e.target.value)}
                    />
                  ) : (
                    `${order.pickup_name}, ${order.pickup_address}, ${order.pickup_phone}`
                  )}
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-drop_name`]: true }))}>
                  {isEditing[`${order.id}-drop_name`] ? (
                    <input
                      type="text"
                      defaultValue={order.drop_name}
                      onBlur={(e) => handleDropdownChange(order.id, 'drop_name', e.target.value)}
                    />
                  ) : (
                    `${order.drop_name}, ${order.drop_address}, ${order.drop_phone}`
                  )}
                </td>
                <td>
                  <select
                    value={order.order_type}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="Instant">INSTANT</option>
                    <option value="Standard">STANDARD</option>
                    <option value="B2B">B2B</option>
                  </select>
                </td>

                <td>
                  <select
                    value={order.pb}
                    onChange={(e) => handlePBChange(order.id, e.target.value)}
                  >
                    <option value="Due">DUE</option>
                    <option value="Prepaid">PREPAID</option>
                    <option value="COD">COD</option>
                  </select>
                </td>
                <td>
                  <select
                    value={order.dc}
                    onChange={(e) => handleDCChange(order.id, e.target.value)}
                  >
                    <option value="Due">DUE</option>
                    <option value="Prepaid">PREPAID</option>
                    <option value="COD">COD</option>
                  </select>
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-pb_amount`]: true }))}>
                  {isEditing[`${order.id}-pb_amount`] ? (
                    <input
                      type="number"
                      defaultValue={order.pb_amount}
                      onBlur={(e) => handleDropdownChange(order.id, 'pb_amount', e.target.value)}
                    />
                  ) : (
                    order.pb_amount
                  )}
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-dc_amount`]: true }))}>
                  {isEditing[`${order.id}-dc_amount`] ? (
                    <input
                      type="number"
                      defaultValue={order.dc_amount}
                      onBlur={(e) => handleDropdownChange(order.id, 'dc_amount', e.target.value)}
                    />
                  ) : (
                    order.dc_amount
                  )}
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-auto_tsb`]: true }))}>
                  {isEditing[`${order.id}-auto_tsb`] ? (
                    <input
                      type="number"
                      defaultValue={order.auto_tsb}
                      onBlur={(e) => handleDropdownChange(order.id, 'auto_tsb', e.target.value)}
                    />
                  ) : (
                    order.auto_tsb
                  )}
                </td>
                <td onClick={() => setIsEditing((prev) => ({ ...prev, [`${order.id}-auto_cid`]: true }))}>
                  {isEditing[`${order.id}-auto_cid`] ? (
                    <input
                      type="number"
                      defaultValue={order.auto_cid}
                      onBlur={(e) => handleDropdownChange(order.id, 'auto_cid', e.target.value)}
                    />
                  ) : (
                    order.auto_cid
                  )}
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Returned">Returned</option>
                    <option value="Canceled by Customer">Canceled by Customer</option>
                    <option value="Failed">Failed</option>
                    <option value="Pre Order">Pre Order</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
