'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from './VendorData.module.css';
import Layout from '../components/Layout';

export default function VendorDataPage() {
  const [vendorEmails, setVendorEmails] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // For dropdown search
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recordsPerPage = 15;

  useEffect(() => {
    const fetchVendorEmails = async () => {
      try {
        const { data, error } = await supabase
          .from('order_data')
          .select('vendor_email')
          .neq('vendor_email', null)
          .order('vendor_email', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          const uniqueEmails = [...new Set(data.map((item: { vendor_email: string }) => item.vendor_email))];
          setVendorEmails(uniqueEmails);
          setFilteredEmails(uniqueEmails);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    fetchVendorEmails();
  }, []);

  useEffect(() => {
    if (!selectedVendor) {
      setVendorData([]);
      return;
    }

    const fetchVendorData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('order_data')
          .select('*')
          .eq('vendor_email', selectedVendor)
          .order('created_at', { ascending: true }); // Ensure data is ordered by created_at

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setVendorData(data);
          setFilteredData(data);
        }
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
  }, [selectedVendor]);

  useEffect(() => {
    const filtered = vendorEmails.filter((email) =>
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmails(filtered);
  }, [searchTerm, vendorEmails]);

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

  const handleVendorSelect = (email: string) => {
    setSelectedVendor(email);
    setSearchTerm('');
    setFilteredEmails([]);
    setCurrentPage(1);
  };

  const totalBalanceRemaining = vendorData.reduce(
    (sum, order) => sum + (Number(order.cid) || 0),
    0
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentData = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <Layout>
    <div className={styles.container}>
      <h2 className={styles.title}>Vendor Data</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Vendor Email Selector */}
      <div className={styles.selector}>
        <label htmlFor="vendor-email-dropdown">Select Vendor Email:</label>
        <select
          id="vendor-email-dropdown"
          value={selectedVendor || ''}
          onChange={(e) => handleVendorSelect(e.target.value)}
        >
          <option value="" disabled>
            Choose a vendor email
          </option>
          {vendorEmails.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>

        <label htmlFor="vendor-email-search">Search Vendor Email:</label>
        <input
          id="vendor-email-search"
          type="text"
          placeholder="Search vendor email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ul className={styles.searchResults}>
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <li
                  key={email}
                  className={styles.searchItem}
                  onClick={() => handleVendorSelect(email)}
                >
                  {email}
                </li>
              ))
            ) : (
              <li className={styles.noResults}>No matching vendors</li>
            )}
          </ul>
        )}
      </div>

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

      {loading ? (
        <p>Loading vendor data...</p>
      ) : currentData.length > 0 ? (
        <div>
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
                <th>CID</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let runningBalance = filteredData
                  .slice(0, indexOfFirstRecord)
                  .reduce((sum, order) => sum + (Number(order.cid) || 0), 0); // Balance from previous pages
                return currentData.map((order) => {
                  const cidValue = Number(order.cid) || 0;
                  runningBalance += cidValue;

                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.drop_name || 'N/A'}</td>
                      <td>{order.drop_address || 'N/A'}</td>
                      <td>{order.drop_phone || 'N/A'}</td>
                      <td>{order.pickup_name || 'N/A'}</td>
                      <td>{order.pickup_address || 'N/A'}</td>
                      <td>{order.pickup_phone || 'N/A'}</td>
                      <td>{cidValue}</td>
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
        <p>No data available for the selected vendor email.</p>
      )}
    </div>
    </Layout>
  );
}
