import { Link } from "react-router";
import arrowLeft from "../../assets/icons/arrow-left.svg";
import modeDot from "../../assets/icons/mode-dot.svg";
import styles from "./SimulatorPanel.module.css";

function SimulatorPanel({ location, modeLabel = "보기 모드", children }) {
  return (
    <section className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>3D SIMULATOR</h2>
        <p className={styles.location}>{location}</p>
        <Link to="/map" className={styles.mapLink}>
          <img src={arrowLeft} alt="" className={styles.mapArrow} />
          <span>Aero MAP</span>
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.mode}>
          <img src={modeDot} alt="" />
          <span>{modeLabel}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default SimulatorPanel;
