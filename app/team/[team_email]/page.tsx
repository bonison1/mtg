'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import styles from './TeamData.module.css';

export default function TeamDetailsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<{ [date: string]: any[] }>({});
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [submittedAmount, setSubmittedAmount] = useState<number>(0);
  const [commissionPayout, setCommissionPayout] = useState<number>(0);
  const [remainingCommission, setRemainingCommission] = useState<number>(0);
  const [originalCIDs, setOriginalCIDs] = useState<{ [date: string]: number }>({});
  const [submittedAmounts, setSubmittedAmounts] = useState<{ [date: string]: number }>({});
  const [overallTotalCommission, setOverallTotalCommission] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();

  const teamEmail = typeof params.team_email === 'string' ? decodeURIComponent(params.team_email) : '';

  useEffect(() => {
    if (!teamEmail) {
      setError('No team email specified.');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data: fetchedOrders, error: fetchError } = await supabase
          .from('order_data')
          .select('*')
          .eq('team', teamEmail)
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setOrders(fetchedOrders || []);

        const grouped = fetchedOrders.reduce((groups: { [date: string]: any[] }, order) => {
          const localDate = new Date(order.created_at).toLocaleDateString('en-CA');
          if (!groups[localDate]) {
            groups[localDate] = [];
          }
          groups[localDate].push(order);
          return groups;
        }, {});

        setGroupedOrders(grouped);

        const initialCIDs = Object.entries(grouped).reduce((acc, [date, orders]) => {
          const totalCID = orders.reduce((sum, order) => sum + (Number(order.cid) || 0), 0);
          acc[date] = totalCID;
          return acc;
        }, {} as { [date: string]: number });

        setOriginalCIDs(initialCIDs);

        const { data: billingData, error: billingError } = await supabase
          .from('cid_billing')
          .select('*')
          .eq('team_id', teamEmail);

        if (billingError) {
          throw new Error(billingError.message);
        }

        const submittedAmountsByDate = billingData?.reduce(
          (acc: { [date: string]: number }, billingEntry: any) => {
            const localDate = new Date(billingEntry.date).toLocaleDateString('en-CA');
            acc[localDate] = (acc[localDate] || 0) + billingEntry.submitted_amount;
            return acc;
          },
          {}
        );

        setSubmittedAmounts(submittedAmountsByDate || {});

        const overallCommission = Object.values(grouped).reduce((sum, orders) => {
          const totalDC = orders.reduce((sum, order) => sum + (Number(order.dcAmt) || 0), 0);
          return sum + totalDC * 0.7;
        }, 0);

        const { data: payoutData, error: payoutError } = await supabase
          .from('commission_payout')
          .select('payout_amount')
          .eq('team_id', teamEmail);

        if (payoutError) {
          throw new Error(payoutError.message);
        }

        const totalPayouts = payoutData?.reduce(
          (sum: number, payout: { payout_amount: number }) => sum + payout.payout_amount,
          0
        );

        setOverallTotalCommission(overallCommission);
        setRemainingCommission(overallCommission - (totalPayouts || 0));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
    };

    fetchOrders();
  }, [teamEmail]);

  const handleCIDSubmit = async (currentDate: string) => {
    if (submittedAmount <= 0 || submittedAmount > (originalCIDs[currentDate] || 0)) {
      alert('Invalid submitted amount!');
      return;
    }

    try {
      const { data, error } = await supabase.from('cid_billing').insert([
        { date: currentDate, submitted_amount: submittedAmount, team_id: teamEmail },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setSubmittedAmounts((prev) => ({
        ...prev,
        [currentDate]: (prev[currentDate] || 0) + submittedAmount,
      }));

      alert('CID amount submitted successfully!');
      setSubmittedAmount(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handlePayoutSubmit = async () => {
    if (commissionPayout <= 0 || commissionPayout > remainingCommission) {
      alert('Invalid payout amount!');
      return;
    }

    try {
      const { data, error } = await supabase.from('commission_payout').insert([
        { date: new Date().toISOString().split('T')[0], payout_amount: commissionPayout, team_id: teamEmail },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setRemainingCommission((prev) => prev - commissionPayout);
      alert('Commission payout submitted successfully!');
      setCommissionPayout(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const dates = Object.keys(groupedOrders).sort();
  const currentDate = dates[currentPage];
  const ordersForDate = groupedOrders[currentDate] || [];
  const originalCID = originalCIDs[currentDate] || 0;
  const alreadySubmitted = submittedAmounts[currentDate] || 0;
  const totalCID = originalCID - alreadySubmitted;
  const totalDCAmount = ordersForDate.reduce((sum, order) => sum + (Number(order.dcAmt) || 0), 0);
  const totalCommission = totalDCAmount * 0.7;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Details for Team: {teamEmail}</h2>
      <button className={styles.backButton} onClick={() => router.push('/team/team_bill')}>
        Back to Team Summary
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.overallCommission}>
        <p>Overall Total Commission: {overallTotalCommission.toFixed(2)}</p>
        <p>Remaining Commission: {remainingCommission.toFixed(2)}</p>
      </div>

      <div className={styles.payoutSection}>
        <input
          type="number"
          value={commissionPayout}
          onChange={(e) => setCommissionPayout(Number(e.target.value))}
          placeholder="Enter commission payout"
        />
        <button onClick={handlePayoutSubmit}>Submit Payout</button>
      </div>

      <div className={styles.dateSelector}>
        <label htmlFor="date-selector">Select Date:</label>
        <select
          id="date-selector"
          onChange={(e) => setCurrentPage(dates.indexOf(e.target.value))}
          value={currentDate}
        >
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {currentDate && (
        <div>
          <h3>Orders for {currentDate}</h3>
          <p>Total DC Amount: {totalDCAmount}</p>
          <p>Total Commission: {totalCommission.toFixed(2)}</p>
          <p>Original CID: {originalCID}</p>
          <p>Submitted CID: {alreadySubmitted}</p>
          <p>Total CID Remaining: {totalCID}</p>


          <div className={styles.submitSection}>
            <input
              type="number"
              value={submittedAmount}
              onChange={(e) => setSubmittedAmount(Number(e.target.value))}
              placeholder="Enter CID amount"
            />
            <button onClick={() => handleCIDSubmit(currentDate)}>Submit CID</button>
          </div>

          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Drop Name</th>
                <th>Pickup Name</th>
                <th>CID</th>
                <th>DC Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersForDate.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.drop_name || 'N/A'}</td>
                  <td>{order.pickup_name || 'N/A'}</td>
                  <td>{order.cid || 'N/A'}</td>
                  <td>{order.dcAmt || 'N/A'}</td>
                  <td>{order.status || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
