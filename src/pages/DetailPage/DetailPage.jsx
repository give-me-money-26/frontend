import { useState } from "react";
import { Link } from "react-router";
import arrowRightLong from "../../assets/icons/arrow-right-long.svg";
import simulatorButtonIcon from "../../assets/icons/simulator-button-icon.svg";
import BackButton from "../../components/common/BackButton";
import CostAnalysis from "../../components/detail/CostAnalysis";
import DataDescription from "../../components/detail/DataDescription";
import KeyMetrics from "../../components/detail/KeyMetrics";
import styles from "./DetailPage.module.css";

const COMMON_INFO_ITEMS = [
  { title: "연간 발전량", description: "= 회수 전력 * 일 운전 시간 / 1,000" },
  { title: "회수 전력", description: "= 풍력 에너지 밀도 * 회수 면적 * 가정한 전체 변환계수" },
];

const VIEWS = {
  revenue: {
    title: "예상 수익 상세분석",
    toggleLabel: "환경 영향 상세분석 보기",
    highlight: { label: "예상 연간 절감액", value: "1,454", unit: "원" },
    infoItems: [
      { title: "연간 절감액", description: "= 연간 발전량 * 적용 전기요금" },
      ...COMMON_INFO_ITEMS,
    ],
  },
  environment: {
    title: "환경 영향 상세분석",
    toggleLabel: "예상 수익 상세분석 보기",
    highlight: {
      label: "예상 연간 탄소저감",
      value: "2.43",
      unit: (
        <>
          kgCO<sub>2</sub>
        </>
      ),
    },
    infoItems: [
      { title: "탄소 저감량", description: "= 연간 발전량 * 적용 배출계수" },
      ...COMMON_INFO_ITEMS,
    ],
  },
};

const TURBINES = [
  { name: "터빈 1", price: "1,454", installCost: "1,454" },
  { name: "터빈 2", price: "1,454", installCost: "1,454" },
  { name: "터빈 3", price: "1,454", installCost: "1,454" },
];

function DetailPage({ initialView = "revenue" }) {
  const [view, setView] = useState(initialView);
  const { title, toggleLabel, highlight, infoItems } = VIEWS[view];

  const toggleView = () => {
    setView((prev) => (prev === "revenue" ? "environment" : "revenue"));
  };

  return (
    <div className={styles.page}>
      <BackButton />

      <h2 className={styles.title}>{title}</h2>

      <div className={styles.content}>
        <div className={styles.purpose}>
          <span className={styles.purposeLabel}>시뮬레이션 목적</span>
          <span className={styles.purposeText}>
            배기 바람의 에너지 회수 가능성을 수익과 탄소 절감 효과로 시각화해,
            누구나 쉽게 비교하고 판단할 수 있게 합니다.
          </span>
        </div>

        <div className={styles.analysis}>
          <section className={styles.top}>
            <KeyMetrics
              building="니콜스관"
              highlight={highlight}
              infoItems={infoItems}
              generation="6.08"
              interpretation="현재 설정이 운전시간동안 유지된다는 가정입니다. 실제 설치 판단에는 시각별 실측 풍속, 터빈 성능 곡선, 운전 일정과 설비 영향 검증이 필요합니다. 전기요금은 예시 입력값입니다."
            />
            <DataDescription
              calculation={[
                "회수 전력 2.08 W ⨯ 8시간 ⨯ 365일 ÷ 1,000",
                "절감액 = 발전량 ⨯ 150원/kWh",
              ]}
              assumption={[
                "회수 면적 0.8 m² · 효율 25%",
                "배기구 거리 4.5 m · 터빈 각도 6° · 배치 계수 0.628",
                "에너지 밀도 16.60 W/m²",
              ]}
            />
          </section>

          <div className={styles.bottom}>
            <CostAnalysis turbines={TURBINES} payback="1,454" />

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={toggleView}
              >
                {toggleLabel}
                <img src={arrowRightLong} alt="" />
              </button>
              <Link to="/simulator" className={styles.simulatorButton}>
                <img src={simulatorButtonIcon} alt="" />
                3D 시뮬레이터 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
