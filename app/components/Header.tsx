"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './GlobalHeader.module.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    const employeeJson = sessionStorage.getItem('employee');
    setIsLoggedIn(!!userJson);
    setIsEmployeeLoggedIn(!!employeeJson);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('employee');
    setIsLoggedIn(false);
    setIsEmployeeLoggedIn(false);
    router.push('/');
  };

  return (
    <header className={styles.header}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <Link href="/home" passHref>
          <Image src="/logo.png" alt="Logo" width={50} height={50} className={styles.logoImage} />
        </Link>
      </div>

      {/* Hamburger Menu Button for Mobile */}
      <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle menu">
        <FiMenu className={styles.icon} />
      </button>

      {/* Navigation Menu */}
      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        

        {/* Conditional Rendering for Logged In Users or Employees */}
        {isLoggedIn && !isEmployeeLoggedIn && (
          <>
            <Link href="/dashboard" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/discover" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Discover
            </Link>
            <Link href="/contacts" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Contacts
            </Link>
            <Link href="/view-orders" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              View my Orders
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Log Out
            </button>
          </>
        )}

        {isEmployeeLoggedIn && (
          <>
            <Link href="/employee-dashboard" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Employee Dashboard
            </Link>
            <Link href="/employee-dashboard" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Order Entry
            </Link>
            <Link href="/orders" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Orders
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Employee Logout
            </button>
          </>
        )}

        {/* For non-logged in users */}
        {!isLoggedIn && !isEmployeeLoggedIn && (
          <>
            <Link href="/home" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/login" className={styles.navButton} onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
