import liveSimulatorIcon from "../../assets/icons/live-simulator.svg";
import styles from "./LiveSimulatorCard.module.css";

function LiveSimulatorCard({
  isControlMode = false,
  baseline,
  onSetBaseline,
  onClearBaseline,
  onToggleMode,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.main}>
        <img src={liveSimulatorIcon} alt="" />
        <div className={styles.text}>
          <h3 className={styles.title}>3D 라이브 시뮬레이터</h3>
          <p className={styles.subtitle}>터빈 배치 조정 후 비교하기</p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={baseline ? onClearBaseline : onSetBaseline}
          >
            {baseline ? "기준안 해제" : "현재 조건으로 기준 설정"}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            aria-pressed={isControlMode}
            onClick={onToggleMode}
          >
            {isControlMode ? "보기모드 변환" : "조작모드 변환"}
          </button>
        </div>
      </div>

      {baseline && (
        <p className={styles.baseline}>
          <span>현재 기준안 정보</span>
          <span className={styles.baselineValue}>
            시각 {baseline.hour}시 · 배기구 거리 {baseline.distanceM.toFixed(1)}
            m · 터빈 각도 {baseline.angleDegrees}°
          </span>
        </p>
      )}
    </section>
  );
}

export default LiveSimulatorCard;
