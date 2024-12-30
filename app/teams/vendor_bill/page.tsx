'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import styles from './VendorsSummary.module.css';

export default function VendorsSummaryPage() {
  const [vendorsData, setVendorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // For searching vendor email
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]); // Filtered vendor data
  const router = useRouter();

  useEffect(() => {
    const fetchVendorsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('order_data')
          .select('vendor_email, tsb');

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          // Group by vendor_email and calculate total CID
          const groupedVendors = data.reduce((acc: any, order: { vendor_email: string; tsb: number }) => {
            const email = order.vendor_email;
            const cidValue = Number(order.tsb) || 0;

            if (!acc[email]) {
              acc[email] = { email, totalCID: 0 };
            }

            acc[email].totalCID += cidValue;
            return acc;
          }, {});

          const vendorList = Object.values(groupedVendors);
          setVendorsData(vendorList);
          setFilteredVendors(vendorList);
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

    fetchVendorsData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
    const filtered = vendorsData.filter((vendor) =>
      vendor.email.toLowerCase().includes(query)
    );
    setFilteredVendors(filtered);
  };

  const handleVendorClick = (email: string) => {
    router.push(`/teams/${encodeURIComponent(email)}`); // Navigate to vendor-specific page
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Vendors Summary</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Search Vendor Email */}
      <div className={styles.searchContainer}>
        <label htmlFor="vendor-search">Search Vendor Email:</label>
        <input
          id="vendor-search"
          type="text"
          placeholder="Search by vendor email"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <p>Loading vendor data...</p>
      ) : filteredVendors.length > 0 ? (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Vendor Email</th>
              <th>Total TSB</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.email}>
                <td>{vendor.email}</td>
                <td>{vendor.totalCID}</td>
                <td>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleVendorClick(vendor.email)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No vendors found.</p>
      )}
    </div>
  );
}
