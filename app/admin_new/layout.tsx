import React from 'react';
import styles from './DashboardPage.module.css';
import { navigationItems } from '../../lib/navData1';
import Link from 'next/link';

const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Dashboard Overview</h1>
      <div className={styles.cardContainer}>
        {navigationItems.map((item) => (
          <div key={item.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p className={styles.cardContent}>{item.description}</p>
            <div className={styles.cardAction}>
            <Link href="/admin1/components/CreateOrder">
          <button className={styles.mainButton}>Create Order</button>
        </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
