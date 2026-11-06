import { useEffect, useRef } from "react";
import { useSim } from "../../state/simulatorStore";
import { createSimulatorScene } from "../../three/createSimulatorScene";
import styles from "./Simulator3D.module.css";

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
// store 변경은 subscribe로 장면에 바로 넘겨서 React 리렌더 없이 움직임
function Simulator3D({ className }) {
  const hostRef = useRef(null);
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
    sim.update(pickSceneState(useSim.getState()));
    const unsubscribe = useSim.subscribe((s) => sim.update(pickSceneState(s)));
    return () => {
      unsubscribe();
      sim.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={[styles.host, className].filter(Boolean).join(" ")}
      data-mode={mode}
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
  );
}

export default Simulator3D;
