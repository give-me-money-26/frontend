import { Link } from "react-router";
import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import styles from "./SummaryCard.module.css";

function SummaryCard({
  to,
  title,
  value,
  unit,
  description,
  footerLabel,
  footerValue,
}) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.more}>
          자세히 보기
          <ArrowRightIcon aria-hidden="true" />
        </span>
      </div>
      <p className={styles.metric}>
        <span className={styles.value}>{value}</span>
        <span className={styles.unit}>{unit}</span>
      </p>
      <p className={styles.description}>{description}</p>
      <hr className={styles.divider} />
      <div className={styles.footer}>
        <span>{footerLabel}</span>
        <span>{footerValue}</span>
      </div>
    </Link>
  );
}

export default SummaryCard;
