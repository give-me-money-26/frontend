import styles from "./Logo.module.css";

// 크기와 자간은 사용하는 쪽에서 className으로 지정한다.
function Logo({ className }) {
  return (
    <span className={`${styles.logo} ${className ?? ""}`}>
      <span className={styles.aero}>Aero</span>
      <span className={styles.harvest}>Harvest</span>
    </span>
  );
}

export default Logo;
