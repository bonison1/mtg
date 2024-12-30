"use client";

import React from "react";
import styles from "../styles/navbar.module.css";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <header className={styles.navbar}>
      {/* Toggle Sidebar Button */}
      <button onClick={toggleSidebar} className={styles.toggleButton}>
        Menu
      </button>
      {/* Navbar Title */}
      <div className={styles.title}>Dashboard</div>
      {/* User Actions */}
      <div className={styles.actions}>
        <span>Admin</span>
        <button className={styles.logoutButton}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
