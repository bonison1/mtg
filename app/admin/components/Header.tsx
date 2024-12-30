import styles from '../styles/Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="font-bold">My App</div>
      <nav className={styles.nav}>
        <a href="/">Home</a>
        <a href="/discover">Discover</a>
        <a href="/about">About Us</a>
      </nav>
    </header>
  );
};

export default Header;
