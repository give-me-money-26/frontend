import { ANGLE_RANGE, DISTANCE_RANGE } from "../../data/turbine";
import { useSim } from "../../state/simulatorStore";
import Slider from "../common/Slider";
import styles from "./ControlBar.module.css";

function ControlBar({ power = "123", delta = "+0.0W (+0.0%)", onCommit }) {
  const distanceM = useSim((s) => s.distanceM);
  const angleDegrees = useSim((s) => s.angleDegrees);
  const setSim = useSim((s) => s.set);

  return (
    <div className={styles.bar}>
      <Slider
        label="배기구로부터 거리"
        valueText={`${distanceM.toFixed(1)} m`}
        value={distanceM}
        min={DISTANCE_RANGE[0]}
        max={DISTANCE_RANGE[1]}
        step={0.1}
        onChange={(next) => setSim({ distanceM: next })}
        onCommit={onCommit}
      />
      <Slider
        label="터빈 각도"
        valueText={`${angleDegrees}°`}
        value={angleDegrees}
        min={ANGLE_RANGE[0]}
        max={ANGLE_RANGE[1]}
        onChange={(next) => setSim({ angleDegrees: next })}
        onCommit={onCommit}
      />
      <div className={styles.result}>
        <p className={styles.resultLabel}>예상 회수 전력</p>
        <p className={styles.delta}>기준 대비 {delta}</p>
        <p className={styles.power}>
          <span className={styles.powerValue}>{power}</span>
          <span className={styles.powerUnit}>W</span>
        </p>
      </div>
    </div>
  );
}

export default ControlBar;
