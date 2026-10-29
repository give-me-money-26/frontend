import discoveryIcon from "../../assets/icons/discovery.svg";
import inspectionIcon from "../../assets/icons/inspection.svg";
import judgementIcon from "../../assets/icons/judgement.svg";
import SidePanel from "./SidePanel";
import styles from "./PlanningPanel.module.css";

// 아이콘은 색이 들어간 이미지라 <img>로 쓰고, 크기는 Figma 원본 그대로 둔다.
// 설명의 줄바꿈은 시안과 같게 \n으로 고정한다.
const FLOW = [
  {
    icon: discoveryIcon,
    iconSize: 40,
    title: "발견",
    description: "지도에서\n분석할 건물 및\n데이터 출처 확인",
  },
  {
    icon: inspectionIcon,
    iconSize: 46,
    title: "검토",
    description: "3D에서\n배기구·터빈 배치와\n설치 조건 비교",
  },
  {
    icon: judgementIcon,
    iconSize: 48,
    title: "판단",
    description: "발전량·절감액\n·환경 효과와\n계산 근거 확인",
  },
];

const SECTIONS = [
  {
    title: "현재 구현",
    description:
      "테스트 기반 건물 분석, 3D 흐름 시각화, 터빈 배치 조절, 기준안 비교, 계산 조건 입력과 결과 해석을 제공합니다.",
  },
  {
    title: "다음 검증 단계",
    description:
      "현장 치수와 배기구 위치 확보 → 시각별 풍속 실측 → 터빈 성능 곡선 적용 → 설비 영향 검증 → 설치 후보 선정. 테스트 수치의 우선순위는 실제 설치 추천 순위로 확정하지 않습니다.",
  },
  {
    title: "성과 판단 기준",
    description:
      "예측값의 실측 대비 오차, 설치 조건에 따른 발전량 차이, 설치비 대비 순절감액, 기존 HVAC 운전에 미치는 영향을 확인합니다.",
  },
];

function PlanningPanel({ onClose }) {
  return (
    <SidePanel
      title="서비스 기획"
      subtitle="학교 재무 · 환경 담당자가 건물의 배기 에너지 회수 가능성을 비교하고, 실측이 필요한 후보를 정하는 도구입니다."
      onClose={onClose}
    >
      <div className={styles.flowArrow} aria-hidden="true" />

      <ol className={styles.flow}>
        {FLOW.map(({ icon, iconSize, title, description }) => (
          <li key={title} className={styles.flowItem}>
            <span className={styles.flowIcon}>
              <img src={icon} alt="" width={iconSize} height={iconSize} />
            </span>
            <h3 className={styles.flowTitle}>{title}</h3>
            <p className={styles.flowDescription}>{description}</p>
          </li>
        ))}
      </ol>

      <div className={styles.card}>
        {SECTIONS.map(({ title, description }) => (
          <section key={title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            <p className={styles.sectionDescription}>{description}</p>
          </section>
        ))}
      </div>
    </SidePanel>
  );
}

export default PlanningPanel;
