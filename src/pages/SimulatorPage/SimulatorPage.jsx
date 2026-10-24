import DataCard from "../../components/simulator/DataCard";
import LiveSimulatorCard from "../../components/simulator/LiveSimulatorCard";
import SimulatorPanel from "../../components/simulator/SimulatorPanel";
import SummaryCard from "../../components/simulator/SummaryCard";
import styles from "./SimulatorPage.module.css";

function SimulatorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <SimulatorPanel location="가톨릭대학교 성심교정 · 니콜스관" />

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

        <LiveSimulatorCard />
      </div>

      <DataCard />
    </div>
  );
}

export default SimulatorPage;
