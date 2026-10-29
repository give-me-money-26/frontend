import { useEffect, useState } from "react";
import windIcon from "../../assets/icons/wind.svg";
import logoSymbol from "../../assets/images/onboarding-logo.svg";
import styles from "./LoadingScreen.module.css";

const DURATION = 2000;

// 바람 자국 위치(1440×900 시안 기준 왼쪽 위 좌표)
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

// 건물로 이동하기 전 전체 화면 로딩. 진행률이 100%가 되면 onDone을 부른다.
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
      {WINDS.map(([left, top]) => (
        <img
          key={`${left}-${top}`}
          src={windIcon}
          alt=""
          className={styles.wind}
          style={{
            left: `${(left / 1440) * 100}%`,
            top: `${(top / 900) * 100}%`,
          }}
        />
      ))}

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
