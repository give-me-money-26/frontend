import { Link } from "react-router";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.aero}>Aero</span>
          <span className={styles.harvest}>Harvest</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
