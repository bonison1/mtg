'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Order } from '../../../types/order'; // Define the Order type
import styles from './OrderData.module.css';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<{ [date: string]: Order[] }>({});
  const [currentPage, setCurrentPage] = useState<number>(0); // Show one date per page
  const [submittedAmount, setSubmittedAmount] = useState<number>(0); // For CID submission
  const [commissionPayout, setCommissionPayout] = useState<number>(0); // For commission payout
  const [remainingCommission, setRemainingCommission] = useState<number>(0); // Remaining commission
  const [error, setError] = useState<string | null>(null);
  const [originalCIDs, setOriginalCIDs] = useState<{ [date: string]: number }>({});
  const [submittedAmounts, setSubmittedAmounts] = useState<{ [date: string]: number }>({});
  const [searchDate, setSearchDate] = useState<string>(''); // For dropdown filtering
  const [overallTotalCommission, setOverallTotalCommission] = useState<number>(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const targetEmail = 'naokhum33@gmail.com'; // Target email for the team match

        const { data: fetchedOrders, error: fetchError } = await supabase
          .from('order_data')
          .select('*')
          .eq('team', targetEmail) // Match orders with the target email in the 'team' field
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (fetchedOrders) {
          setOrders(fetchedOrders);

          // Group orders by local date
          const grouped = fetchedOrders.reduce((groups: { [date: string]: Order[] }, order) => {
            const localDate = new Date(order.created_at).toLocaleDateString('en-CA'); // Local date in YYYY-MM-DD format
            if (!groups[localDate]) {
              groups[localDate] = [];
            }
            groups[localDate].push(order);
            return groups;
          }, {});

          setGroupedOrders(grouped);

          // Initialize original CID totals
          const initialCIDs = Object.entries(grouped).reduce((acc, [date, orders]) => {
            const totalCID = orders.reduce((sum, order) => sum + (Number(order.cid) || 0), 0);
            acc[date] = totalCID;
            return acc;
          }, {} as { [date: string]: number });

          setOriginalCIDs(initialCIDs);

          // Fetch already submitted amounts for each date
          const { data: billingData, error: billingError } = await supabase
            .from('cid_billing')
            .select('*')
            .eq('team_id', targetEmail); // Match submitted records with the target email in 'team_id'

          if (billingError) {
            throw new Error(billingError.message);
          }

          const submittedAmountsByDate = billingData?.reduce(
            (acc: { [date: string]: number }, billingEntry: any) => {
              const localDate = new Date(billingEntry.date).toLocaleDateString('en-CA'); // Local date in YYYY-MM-DD format
              acc[localDate] = (acc[localDate] || 0) + billingEntry.submitted_amount;
              return acc;
            },
            {}
          );

          setSubmittedAmounts(submittedAmountsByDate || {});

          // Calculate overall total commission
          const overallCommission = Object.values(grouped).reduce((sum, orders) => {
            const totalDC = orders.reduce((sum, order) => sum + (Number(order.dcAmt) || 0), 0);
            return sum + totalDC * 0.7; // Commission is 70% of total DC
          }, 0);

          // Fetch total commission payouts
          const { data: payoutData, error: payoutError } = await supabase
            .from('commission_payout')
            .select('payout_amount');

          if (payoutError) {
            throw new Error(payoutError.message);
          }

          const totalPayouts = payoutData?.reduce(
            (sum: number, payout: { payout_amount: number }) => sum + payout.payout_amount,
            0
          );

          setOverallTotalCommission(overallCommission);
          setRemainingCommission(overallCommission - (totalPayouts || 0)); // Deduct total payouts from overall commission
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    fetchOrders();
  }, []);

  const handleCIDSubmit = async (currentDate: string) => {
    const targetEmail = 'naokhum33@gmail.com'; // Target email for the team match

    if (submittedAmount <= 0 || submittedAmount > (originalCIDs[currentDate] || 0)) {
      alert('Invalid submitted amount!');
      return;
    }

    try {
      const { data, error } = await supabase.from('cid_billing').insert([
        {
          date: currentDate,
          submitted_amount: submittedAmount,
          team_id: targetEmail, // Associate the submission with the target email
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      // Update submitted amounts
      setSubmittedAmounts((prev) => ({
        ...prev,
        [currentDate]: (prev[currentDate] || 0) + submittedAmount,
      }));

      alert('CID amount submitted successfully!');
      setSubmittedAmount(0); // Reset submitted amount
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  const handlePayoutSubmit = async () => {
    const targetEmail = 'naokhum33@gmail.com'; // Target email for the team match

    if (commissionPayout <= 0 || commissionPayout > remainingCommission) {
      alert('Invalid payout amount!');
      return;
    }

    try {
      const { data, error } = await supabase.from('commission_payout').insert([
        {
          date: new Date().toISOString().split('T')[0], // Use today's date
          payout_amount: commissionPayout,
          team_id: targetEmail, // Associate the payout with the target email
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      // Update remaining commission
      setRemainingCommission((prev) => prev - commissionPayout);

      alert('Commission payout submitted successfully!');
      setCommissionPayout(0); // Reset payout amount
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  const dates = Object.keys(groupedOrders).sort();
  const currentDate = dates[currentPage]; // Date for the current page
  const ordersForDate = groupedOrders[currentDate] || [];
  const originalCID = originalCIDs[currentDate] || 0;
  const alreadySubmitted = submittedAmounts[currentDate] || 0;
  const totalCID = originalCID - alreadySubmitted; // Updated total CID
  const totalDCAmount = ordersForDate.reduce((sum, order) => sum + (Number(order.dcAmt) || 0), 0);
  const totalCommission = totalDCAmount * 0.7;

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDateIndex = dates.indexOf(e.target.value);
    if (selectedDateIndex >= 0) {
      setCurrentPage(selectedDateIndex);
      setSearchDate(''); // Clear search after selecting a date
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Orders for naokhum33@gmail.com</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Overall Total Commission */}
      <div className={styles.overallCommission}>
        <p>Overall Total Commission: {overallTotalCommission.toFixed(2)}</p>
        <p>Remaining Commission: {remainingCommission.toFixed(2)}</p>
      </div>

      {/* Payout Submission Section */}
      <div className={styles.payoutSection}>
        <input
          type="number"
          value={commissionPayout}
          onChange={(e) => setCommissionPayout(Number(e.target.value))}
          placeholder="Enter commission payout"
        />
        <button onClick={handlePayoutSubmit}>Submit Payout</button>
      </div>

      {/* Date Selector */}
      <div className={styles.dateSelector}>
        <label htmlFor="date-selector">Select Date:</label>
        <select id="date-selector" onChange={handleDateChange} value={currentDate}>
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {currentDate ? (
        <div>
          <h3 className={styles.dateHeader}>Orders for {currentDate}</h3>

          {/* Summation Section */}
          <div className={styles.summation}>
            <p>Original Total CID: {originalCID}</p>
            <p>Total CID (Updated): {totalCID}</p>
            <p>Already Submitted: {alreadySubmitted}</p>
            <p>Total DC Amount: {totalDCAmount}</p>
            <p>Total Commission: {totalCommission.toFixed(2)}</p>
          </div>

          {/* Submission Section */}
          <div className={styles.submitSection}>
            <input
              type="number"
              value={submittedAmount}
              onChange={(e) => setSubmittedAmount(Number(e.target.value))}
              placeholder="Enter CID amount"
            />
            <button onClick={() => handleCIDSubmit(currentDate)}>Submit CID</button>
          </div>

          {/* Orders Table */}
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>SL</th>
                <th>ID</th>
                <th>Drop Details</th>
                <th>Pickup Details</th>
                <th>Order Type</th>
                <th>PB Amount</th>
                <th>DC Amount</th>
                <th>CID</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {ordersForDate.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.id}</td>
                  <td>{`${order.drop_name || ''}, ${order.drop_address || ''}, ${order.drop_phone || ''}`}</td>
                  <td>{`${order.pickup_name || ''}, ${order.pickup_address || ''}, ${order.pickup_phone || ''}`}</td>
                  <td>{order.orderType}</td>
                  <td>{order.pbAmt || ''}</td>
                  <td>{order.dcAmt || ''}</td>
                  <td>{order.cid || ''}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
}
