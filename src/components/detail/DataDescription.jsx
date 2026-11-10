import { useRef, useState } from "react";
import sideButton from "../../assets/icons/side-button.svg";
import sideButtonBack from "../../assets/icons/side-button-back.svg";
import MeasurementPanel from "./MeasurementPanel";
import styles from "./DataDescription.module.css";

const PAGE_WIDTH = 478;
const SNAP_THRESHOLD = 0.2;
const CLICK_DISTANCE = 4;

const clamp = (value) => Math.min(Math.max(value, 0), 1);

function DataDescription({ calculation, assumption }) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const isMeasurementPage = progress > 0.5;

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startProgress: Math.round(progress) };
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { startX, startProgress } = dragRef.current;
    setProgress(clamp(startProgress - (e.clientX - startX) / PAGE_WIDTH));
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current) return;
    const { startX, startProgress } = dragRef.current;
    const moved = e.clientX - startX;
    const next = clamp(startProgress - moved / PAGE_WIDTH);

    if (Math.abs(moved) < CLICK_DISTANCE) {
      setProgress(1 - startProgress);
    } else if (startProgress === 0) {
      setProgress(next > SNAP_THRESHOLD ? 1 : 0);
    } else {
      setProgress(next < 1 - SNAP_THRESHOLD ? 0 : 1);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const transition = isDragging ? "none" : undefined;

  return (
    <div className={styles.container} style={{ "--progress": progress }}>
      <div className={styles.viewport}>
        <div className={styles.panel} inert={isMeasurementPage}>
          <div className={styles.content}>
            <section className={styles.section}>
              <h3 className={styles.title}>계산 방법</h3>
              <div className={styles.textBox}>
                <p className={styles.calculation}>
                  {calculation.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </section>
            <section className={styles.section}>
              <h3 className={styles.title}>현재 설치 가정</h3>
              <div className={styles.textBox}>
                <p className={styles.assumption}>
                  {assumption.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </section>
          </div>
        </div>
        <div
          className={styles.cover}
          style={{ transition }}
          inert={!isMeasurementPage}
        >
          <MeasurementPanel />
        </div>
      </div>

      <button
        type="button"
        className={styles.sideButton}
        style={{ transition }}
        tabIndex={-1}
        aria-label={isMeasurementPage ? "계산 방법 보기" : "건물·시간대별 측정값 보기"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img src={isMeasurementPage ? sideButtonBack : sideButton} alt="" draggable={false} />
      </button>
    </div>
  );
}

export default DataDescription;
