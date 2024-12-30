import React from 'react';
import Link from 'next/link';
import styles from './styles/AdminLayout.module.css';
import { navigationItems } from '../../lib/navData1';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/admin1/components/CreateOrder">
          <button className={styles.mainButton}>Create Order</button>
        </Link>
        <Link href="/admin1/components/OrderData">
          <button className={styles.mainButton}>Order Data</button>
        </Link>
        <Link href="/admin1/components/TeamCommissions">
          <button className={styles.mainButton}>Team Commission</button>
        </Link>
        <Link href="/admin1/components/VendorBills">
          <button className={styles.mainButton}>Vendor Bills</button>
        </Link>
        <Link href="/admin1/components/vendor_data">
          <button className={styles.mainButton}>Vendor Data</button>
        </Link>
      </header>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
