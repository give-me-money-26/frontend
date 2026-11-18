import { useEffect, useState } from "react";
import windIcon from "../../assets/icons/wind.svg";
import logoSymbol from "../../assets/images/logo-symbol.svg";
import styles from "./LoadingScreen.module.css";

const DURATION = 2000;
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;
const WIND_DURATIONS = [1.1, 1.4, 1.7];

const WINDS = [
  [172, 143],
  [965, 192],
  [1224, 123],
  [431, 266],
  [259, 416],
  [960, 434],
  [352, 597],
  [149, 714],
  [1142, 729],
  [749, 772],
];

function LoadingScreen({ buildingName, onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const ratio = Math.min(1, (now - start) / DURATION);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <div className={styles.screen} role="status">
      <div className={styles.winds} aria-hidden="true">
        {WINDS.map(([left, top], index) => {
          const x = (left / DESIGN_WIDTH) * 100;
          const duration = WIND_DURATIONS[index % WIND_DURATIONS.length];

          return (
            <img
              key={`${left}-${top}`}
              src={windIcon}
              alt=""
              className={styles.wind}
              style={{
                "--x": `${x}vw`,
                left: `${x}%`,
                top: `${(top / DESIGN_HEIGHT) * 100}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${(-duration * x) / 100}s`,
              }}
            />
          );
        })}
      </div>

      <div className={styles.content}>
        <img src={logoSymbol} alt="" className={styles.logo} />
        <p className={styles.message}>{buildingName}의 바람을 만나러 가는 중</p>
        <div
          className={styles.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="불러오는 중"
        >
          <div className={styles.bar} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.percent}>{progress}%</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
