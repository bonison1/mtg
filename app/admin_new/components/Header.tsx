"use client";

import React from "react";
import styles from "./Header.module.css";

type Section = "vendorBills" | "teamCommissions" | "orderData" | "createOrder";

interface HeaderProps {
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, setCurrentSection }) => {
  return (
    <nav className={styles.headerNav}>
      <ul className={styles.navList}>
        <li
          className={currentSection === "vendorBills" ? styles.active : ""}
          onClick={() => setCurrentSection("vendorBills")}
        >
          Vendor Bills
        </li>
        <li
          className={currentSection === "teamCommissions" ? styles.active : ""}
          onClick={() => setCurrentSection("teamCommissions")}
        >
          Team Commissions
        </li>
        <li
          className={currentSection === "orderData" ? styles.active : ""}
          onClick={() => setCurrentSection("orderData")}
        >
          Order Data
        </li>
        <li
          className={currentSection === "createOrder" ? styles.active : ""}
          onClick={() => setCurrentSection("createOrder")}
        >
          Create Order
        </li>
      </ul>
    </nav>
  );
};

export default Header;
