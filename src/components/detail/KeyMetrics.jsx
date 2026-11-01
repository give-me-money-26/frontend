import detailDownArrow from "../../assets/icons/detail-down-arrow.svg";
import detailScrollbar from "../../assets/icons/detail-scrollbar.svg";
import InfoTip from "./InfoTip";
import styles from "./KeyMetrics.module.css";

function KeyMetrics({ building, highlight, generation, interpretation, infoItems }) {
  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <h3 className={styles.title}>핵심 수치 요약</h3>
        <InfoTip
          label="핵심 수치 요약 정보"
          items={infoItems}
          className={styles.info}
          popoverClassName={styles.infoPopover}
        />

        <div className={styles.box}>
          <div className={styles.list}>
            <div className={styles.metric}>
              <p className={styles.label}>건물</p>
              <p className={styles.text}>{building}</p>
            </div>
            <div className={styles.metric}>
              <p className={styles.label}>{highlight.label}</p>
              <p className={styles.amount}>
                <span className={styles.value}>{highlight.value}</span>
                <span className={styles.unit}>{highlight.unit}</span>
              </p>
            </div>
            <div className={styles.metric}>
              <p className={styles.label}>예상 연간 발전량</p>
              <p className={styles.amount}>
                <span className={styles.value}>{generation}</span>
                <span className={styles.unit}>kWh</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.result}>
        <img src={detailDownArrow} alt="" className={styles.downArrow} />
        <div className={styles.interpretation}>
          <h3 className={styles.resultTitle}>결과 해석</h3>
          <div className={styles.resultBox}>
            <p className={styles.resultText}>{interpretation}</p>
          </div>
          <img src={detailScrollbar} alt="" className={styles.scrollbar} />
        </div>
      </div>
    </div>
  );
}

export default KeyMetrics;
