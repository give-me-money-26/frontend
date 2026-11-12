import { ANGLE_RANGE, DISTANCE_RANGE } from "../../data/turbine";
import { runSimulation } from "../../hooks/useSimulation";
import { useSim } from "../../state/simulatorStore";
import Slider from "../common/Slider";
import styles from "./ControlBar.module.css";

const commitPlacement = () => runSimulation();

const signed = (value, digits) => {
  const text = Math.abs(value).toFixed(digits);
  return `${value < 0 && Number(text) !== 0 ? "-" : "+"}${text}`;
};

const formatDelta = (compare) => {
  if (!compare) return "-";
  const watts = `${signed(compare.recoveredPowerDeltaW, 2)}W`;
  const hasPercent =
    compare.baseline.recoveredPowerW !== 0 &&
    compare.recoveredPowerDeltaPercent != null;
  return hasPercent
    ? `${watts} (${signed(compare.recoveredPowerDeltaPercent, 1)}%)`
    : watts;
};

function ControlBar() {
  const distanceM = useSim((s) => s.distanceM);
  const angleDegrees = useSim((s) => s.angleDegrees);
  const powerW = useSim((s) => s.result?.recoveredPowerW);
  const delta = useSim((s) => formatDelta(s.compare));
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
        onCommit={commitPlacement}
      />
      <Slider
        label="터빈 각도"
        valueText={`${angleDegrees}°`}
        value={angleDegrees}
        min={ANGLE_RANGE[0]}
        max={ANGLE_RANGE[1]}
        onChange={(next) => setSim({ angleDegrees: next })}
        onCommit={commitPlacement}
      />
      <div className={styles.result}>
        <p className={styles.resultLabel}>예상 회수 전력</p>
        <p className={styles.delta}>기준 대비 {delta}</p>
        <p className={styles.power}>
          <span className={styles.powerValue}>
            {powerW === undefined ? "-" : powerW.toFixed(2)}
          </span>
          <span className={styles.powerUnit}>W</span>
        </p>
      </div>
    </div>
  );
}

export default ControlBar;
