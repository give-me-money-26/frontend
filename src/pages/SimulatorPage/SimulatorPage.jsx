import { lazy, Suspense } from "react";
import BackButton from "../../components/common/BackButton";
import ControlBar from "../../components/simulator/ControlBar";
import DataCard from "../../components/simulator/DataCard";
import LiveSimulatorCard from "../../components/simulator/LiveSimulatorCard";
import SimulatorPanel from "../../components/simulator/SimulatorPanel";
import SummaryCard from "../../components/simulator/SummaryCard";
import { BUILDINGS } from "../../data/campus";
import { useSim } from "../../state/simulatorStore";
import styles from "./SimulatorPage.module.css";

const Simulator3D = lazy(
  () => import("../../components/simulator/Simulator3D"),
);

function SimulatorPage() {
  const mode = useSim((s) => s.mode);
  const buildingId = useSim((s) => s.buildingId);
  const baseline = useSim((s) => s.baseline);
  const setSim = useSim((s) => s.set);
  const isControlMode = mode === "control";
  const building = BUILDINGS.find(({ id }) => id === buildingId);

  const setBaseline = () => {
    const { hour, windSpeedMS, distanceM, angleDegrees, conditions } =
      useSim.getState();
    setSim({
      baseline: {
        buildingId,
        hour,
        windSpeedMS,
        distanceM,
        angleDegrees,
        conditions,
      },
    });
  };

  return (
    <div className={styles.page}>
      <BackButton to="/map" />

      <div className={styles.left}>
        <SimulatorPanel
          campus="가톨릭대 성심교정"
          isControlMode={isControlMode}
        >
          <Suspense fallback={null}>
            <Simulator3D />
          </Suspense>
          {isControlMode && <ControlBar />}
        </SimulatorPanel>

        <div className={styles.summaryRow}>
          <SummaryCard
            to="/revenue"
            title="수익 분석"
            value="1,454"
            unit="원 / 1년"
            description="9.7kWh/년 · 현재 풍속 유지 가정"
            footerLabel="단순 투자 회수"
            footerValue="설치비 입력 필요"
          />
          <SummaryCard
            to="/environment"
            title="환경 영향"
            value="3.9"
            unit={
              <>
                kgCO<sub>2</sub> / 1년
              </>
            }
            description="예상 연간 탄소 저감 · 입력한 배출계수 적용"
            footerLabel="에너지 회수"
            footerValue="캠퍼스 보조 전원 검토"
          />
        </div>

        <LiveSimulatorCard
          isControlMode={isControlMode}
          baseline={baseline}
          onSetBaseline={setBaseline}
          onClearBaseline={() => setSim({ baseline: null, compare: null })}
          onToggleMode={() =>
            setSim({ mode: isControlMode ? "view" : "control" })
          }
        />
      </div>

      <DataCard building={building?.name} />
    </div>
  );
}

export default SimulatorPage;
