import modeDot from "../../assets/icons/mode-dot.svg";
import modeDotControl from "../../assets/icons/mode-dot-control.svg";
import pin from "../../assets/icons/pin.png";
import styles from "./SimulatorPanel.module.css";

function SimulatorPanel({ campus, isControlMode = false, children }) {
  return (
    <section className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>3D SIMULATOR</h2>
        <p className={styles.campus}>
          <img src={pin} alt="" className={styles.pin} />
          {campus}
        </p>
      </div>

      <div className={`${styles.card} ${isControlMode ? styles.controlMode : ""}`}>
        <div className={styles.mode}>
          <span className={styles.modeDot}>
            <img src={isControlMode ? modeDotControl : modeDot} alt="" />
          </span>
          <span>{isControlMode ? "조작 모드" : "보기 모드"}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default SimulatorPanel;
