import styles from "./ResetChip.module.css";

function ResetChip({ className = "", onClick, children }) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default ResetChip;
