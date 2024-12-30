"use client";

import React from 'react';
import styles from '../styles/Sidebar.module.css';
import { navigationItems } from '../../../lib/navData';

interface SidebarProps {
  isVisible: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, toggleSidebar }) => {
  return (
    <aside className={`${styles.sidebar} ${!isVisible ? styles.hidden : ''}`}>
      <div className={styles.brand}>
        <span>Startup Dashboard</span>
        <button onClick={toggleSidebar} className={styles.hideButton}>
          Hide
        </button>
      </div>
      <nav>
        <ul>
          {navigationItems.map((item) => (
            <li key={item.title}>
              <a href={item.link}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
