import { useEffect, useRef } from "react";
import { useSim } from "../../state/simulatorStore";
import { createSimulatorScene } from "../../three/createSimulatorScene";
import styles from "./Simulator3D.module.css";

const GUIDES = [
  { label: "건물 회전", action: "마우스 왼쪽 누른 상태로 조작" },
  { label: "화면 이동", action: "마우스 오른쪽 누른 상태로 조작" },
  { label: "확대·축소", action: "휠 조작" },
];

function pickSceneState(s) {
  return {
    buildingId: s.buildingId,
    mode: s.mode,
    distanceM: s.distanceM,
    angleDegrees: s.angleDegrees,
    windSpeedMS: s.result?.windSpeedMS,
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
        {GUIDES.map(({ label, action }) => (
          <li key={label}>
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
