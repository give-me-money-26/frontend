import { useEffect, useRef } from "react";
import handIcon from "../../assets/icons/hand.svg";
import rotateIcon from "../../assets/icons/rotate.svg";
import zoomIcon from "../../assets/icons/zoom.svg";
import { hourlyStrength } from "../../data/wind";
import { useSim } from "../../state/simulatorStore";
import { createSimulatorScene } from "../../three/createSimulatorScene";
import styles from "./Simulator3D.module.css";

const GUIDES = [
  {
    icon: rotateIcon,
    size: 12,
    label: "건물 회전",
    action: "마우스 왼쪽 누른 상태로 조작",
  },
  {
    icon: handIcon,
    size: 13,
    label: "화면 이동",
    action: "마우스 오른쪽 누른 상태로 조작",
  },
  { icon: zoomIcon, size: 11, label: "확대·축소", action: "휠 조작" },
];

function pickSceneState(s) {
  return {
    buildingId: s.buildingId,
    mode: s.mode,
    distanceM: s.distanceM,
    angleDegrees: s.angleDegrees,
    windSpeedMS: s.windSpeedMS,
    hourStrength: hourlyStrength(s.buildingDetail?.hourlySeries, s.hour),
  };
}

// 부모를 꽉 채우므로 부모에 position: relative 필요
function Simulator3D() {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const mode = useSim((s) => s.mode);

  useEffect(() => {
    const host = hostRef.current;
    let sim;
    try {
      sim = createSimulatorScene(host);
    } catch {
      host.dataset.error = "true";
      return undefined;
    }
    sceneRef.current = sim;
    sim.update(pickSceneState(useSim.getState()));
    const unsubscribe = useSim.subscribe((s) => sim.update(pickSceneState(s)));
    return () => {
      unsubscribe();
      sim.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div className={styles.simulator}>
      <div
        ref={hostRef}
        className={styles.host}
        aria-label={
          mode === "control"
            ? "3D 시뮬레이터 조작 모드: 터빈 배치"
            : "3D 시뮬레이터 보기 모드: 건물, 배기구, 바람 흐름"
        }
        role="img"
      >
        <p className={styles.error}>
          이 브라우저에서 3D를 시작할 수 없어요. Chrome, Edge, Safari 최신
          버전에서 열어 주세요.
        </p>
      </div>

      <ul className={styles.guide}>
        {GUIDES.map(({ icon, size, label, action }) => (
          <li key={label} className={styles.guideItem}>
            <img src={icon} alt="" width={size} height={size} />
            {label}: {action}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.reset}
        onClick={() => sceneRef.current?.resetCamera()}
      >
        시점 초기화
      </button>
    </div>
  );
}

export default Simulator3D;
