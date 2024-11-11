import styles from './Footer.module.css';
import Link from 'next/link'; // Make sure to import Link from 'next/link'

export default function Footer() {

  return (
    <footer className={styles.footer}>
      <div>
        <p>&copy; {new Date().getFullYear()} Mateng</p>
      </div>
      <div className={styles['footer-right']}>
        <Link href="/about-us">About Us</Link>
        <Link href="/team-login">Team Dashboard</Link>
      </div>
      <div>
        <Link href="/employee-login">Employee Dashboard</Link>
      </div>
      <div>
        {/* You can add any extra content here, like social media links */}
      </div>
    </footer>
  );
}