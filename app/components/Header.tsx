"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';
import styles from './GlobalHeader.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    const employeeJson = sessionStorage.getItem('employee');
    setIsLoggedIn(!!userJson);
    setIsEmployeeLoggedIn(!!employeeJson);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

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
          <Image src="/logo.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>

      {/* Hamburger Menu Button for Mobile */}
      <div className={styles.menuButton} onClick={toggleMenu}>
        <FiMenu className={styles.icon} aria-label="Menu" />
      </div>

      {/* Navigation Menu */}
      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        <Link href="/home" className={styles.navButton} onClick={handleMenuClose}>Home</Link>
        <Link href="/distance" className={styles.navButton} onClick={handleMenuClose}>Distance</Link>
        <Link href="/discover" className={styles.navButton} onClick={handleMenuClose}>Discover</Link>
        <Link href="/pricing" className={styles.navButton} onClick={handleMenuClose}>Services</Link>

        {/* Conditional Rendering for Orders and Login/Logout */}
        {isLoggedIn || isEmployeeLoggedIn ? (
          <>
            <Link href="/orders" className={styles.navButton} onClick={handleMenuClose}>Orders</Link>
            <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.navButton} onClick={handleMenuClose}>Log In</Link>
            {!isEmployeeLoggedIn && (
              <Link href="/employee-login" className={styles.createTaskButton} onClick={handleMenuClose}>
                Employee Log In
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
