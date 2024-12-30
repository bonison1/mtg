import React from 'react';
import styles from './DashboardPage.module.css';
import { navigationItems } from '../../lib/navData1';

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
              <a href={item.link}>View Details</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
