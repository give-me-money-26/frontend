import liveSimulatorIcon from "../../assets/icons/live-simulator.svg";
import styles from "./LiveSimulatorCard.module.css";

function LiveSimulatorCard({ onSetBaseline, onToggleMode }) {
  return (
    <section className={styles.card}>
      <img src={liveSimulatorIcon} alt="" />
      <div className={styles.text}>
        <h3 className={styles.title}>3D 라이브 시뮬레이터</h3>
        <p className={styles.subtitle}>터빈 배치 조정 후 비교하기</p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onSetBaseline}
        >
          현재 조건으로 기준 설정
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onToggleMode}
        >
          조작모드 변환
        </button>
      </div>
    </section>
  );
}

export default LiveSimulatorCard;
