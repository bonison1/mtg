import styles from './Footer.module.css';
import Link from 'next/link'; // Make sure to import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-left']}>
        <p>&copy; {new Date().getFullYear()} Your App Name. All rights reserved.</p>
      </div>
      <div className={styles['footer-right']}>
        <Link href="/team-login">Team Dashboard</Link>
      </div>
      <div className={styles['footer-right']}>
        <Link href="/employee-login">Employee Dashboard</Link>
      </div>
      <div className={styles['footer-right']}>
        {/* You can add any extra content here, like social media links */}
      </div>
    </footer>
  );
}
