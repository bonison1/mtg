"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Import Supabase client
import { useRouter } from "next/navigation";
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './TeamDashboard.module.css'; // Import the CSS module

export default function TeamDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user data from sessionStorage (team information)
  const teamUser = JSON.parse(sessionStorage.getItem("team_user") || "{}");

  useEffect(() => {
    // Ensure the user is logged in and has team data
    if (!teamUser || !teamUser.team_code || !teamUser.username) {
      setErrorMessage("You are not logged in or have no team assigned.");
      return;
    }

    // Query orders from 'order_data' table where team matches the logged-in user's username
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("order_data")
          .select("*")
          .eq("team", teamUser.username);  // Match team with logged-in user's username

        if (error) throw new Error(error.message);

        setOrders(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An error occurred");
      }
    };

    fetchOrders();
  }, [teamUser]);

  // Handle Logout
  const handleLogout = () => {
    // Clear session storage and redirect to login page
    sessionStorage.removeItem("team_user");
    router.push("/team-login"); // Redirect to login page
  };

  if (errorMessage) {
    return <div className={styles.errorMessage}>{errorMessage}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <h2>Team Dashboard</h2>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>

      <h3>Orders for Team: {teamUser.username}</h3>
      {orders.length === 0 ? (
        <p>No orders found for the team {teamUser.username}.</p>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Team</th>
              <th>Pickup Name</th>
              <th>Pickup Address</th>
              <th>Pickup Phone</th>
              <th>Drop Name</th>
              <th>Drop Address</th>
              <th>Drop Phone</th>
              <th>Order Type</th>
              <th>PB</th>
              <th>DC</th>
              <th>PB Amount</th>
              <th>DC Amount</th>
              <th>Auto TSB</th>
              <th>Auto CID</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.employee_id}</td>
                <td>{order.name}</td>
                <td>{order.email}</td>
                <td>{order.date}</td>
                <td>{order.team}</td>
                <td>{order.pickup_name}</td>
                <td>{order.pickup_address}</td>
                <td>{order.pickup_phone}</td>
                <td>{order.drop_name}</td>
                <td>{order.drop_address}</td>
                <td>{order.drop_phone}</td>
                <td>{order.order_type}</td>
                <td>{order.pb}</td>
                <td>{order.dc}</td>
                <td>{order.pb_amount}</td>
                <td>{order.dc_amount}</td>
                <td>{order.auto_tsb}</td>
                <td>{order.auto_cid}</td>
                <td>{order.status}</td>
                <td>{order.created_at}</td>
                <td>{order.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Footer />
    </div>
  );
}
