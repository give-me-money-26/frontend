import styles from "./Logo.module.css";

function Logo({ className }) {
  return (
    <span className={`${styles.logo} ${className ?? ""}`}>
      <span className={styles.aero}>Aero</span>
      <span className={styles.harvest}>Harvest</span>
    </span>
  );
}

export default Logo;
