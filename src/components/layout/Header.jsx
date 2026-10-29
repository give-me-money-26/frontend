import { Link } from "react-router";
import Logo from "../common/Logo";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/simulator" className={styles.logoLink}>
          <Logo className={styles.logo} />
        </Link>
      </div>
    </header>
  );
}

export default Header;
