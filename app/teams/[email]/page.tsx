'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import styles from './VendorData.module.css';

export default function VendorDataPage() {
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  const emailParam = params.email;
  const email = emailParam ? decodeURIComponent(emailParam as string) : ''; // Decode email
  const recordsPerPage = 15;

  useEffect(() => {
    if (!email) {
      setError('No vendor email specified.');
      setLoading(false);
      return;
    }

    const fetchVendorData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('order_data')
          .select('*')
          .eq('vendor_email', email) // Match decoded email
          .order('created_at', { ascending: true }); // Ensure data is ordered by created_at

        if (error) {
          throw new Error(error.message);
        }

        setVendorData(data || []);
        setFilteredData(data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [email]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    const filtered = vendorData.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to the first page on search
  };

  const totalBalanceRemaining = vendorData.reduce(
    (sum, order) => sum + (Number(order.tsb) || 0),
    0
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentData = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Data for Vendor: {email}</h2>

      <button className={styles.backButton} onClick={() => router.push('/teams/vendor_bill')}>
        Back to Vendors Summary
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Loading vendor data...</p>
      ) : currentData.length > 0 ? (
        <div>
          {/* Total Balance Remaining */}
          <div className={styles.totalBalance}>
            <p>
              <strong>Total Balance Remaining:</strong> {totalBalanceRemaining}
            </p>
          </div>

          {/* Search Under the Table */}
          <div className={styles.tableSearch}>
            <label htmlFor="table-search">Search in Table:</label>
            <input
              id="table-search"
              type="text"
              placeholder="Search in table"
              onChange={handleSearch}
            />
          </div>

          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Drop Name</th>
                <th>Drop Address</th>
                <th>Drop Phone</th>
                <th>Pickup Name</th>
                <th>Pickup Address</th>
                <th>Pickup Phone</th>
                <th>TSB</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let runningBalance = filteredData
                  .slice(0, indexOfFirstRecord)
                  .reduce((sum, order) => sum + (Number(order.tsb) || 0), 0); // Balance from previous pages
                return currentData.map((order) => {
                  const tsbValue = Number(order.tsb) || 0;
                  runningBalance += tsbValue;

                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.drop_name || 'N/A'}</td>
                      <td>{order.drop_address || 'N/A'}</td>
                      <td>{order.drop_phone || 'N/A'}</td>
                      <td>{order.pickup_name || 'N/A'}</td>
                      <td>{order.pickup_address || 'N/A'}</td>
                      <td>{order.pickup_phone || 'N/A'}</td>
                      <td>{tsbValue}</td>
                      <td>{runningBalance}</td>
                      <td>{order.status || 'N/A'}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.ceil(filteredData.length / recordsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(filteredData.length / recordsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>No data available for the selected vendor.</p>
      )}
    </div>
  );
}
