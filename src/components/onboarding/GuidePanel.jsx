import SidePanel from "./SidePanel";
import styles from "./GuidePanel.module.css";

const STEPS = [
  {
    title: "건물 선택",
    description:
      "지도나 목록에서 건물을 선택하면 바람 로딩을 거쳐 3D 분석 화면으로 들어갑니다.",
  },
  {
    title: "조건 확인",
    description:
      "시간대별 테스트 밀도와 예상 회수 전력을 확인하세요. 풍속을 직접 조절하거나 계산 조건에서 회수 면적·효율·운전시간을 바꿀 수 있습니다.",
  },
  {
    title: "배치 비교",
    description:
      "현재 조건을 기준안으로 설정하고 터빈 거리와 각도를 조절하세요. 보기 모드로 돌아가도 배치 조건과 계산 결과는 유지됩니다.",
  },
  {
    title: "효과 해석",
    description:
      "수익과 환경 카드에서 계산 방식과 가정을 확인하세요. 현장 치수·설비 영향 검증 후에 실제 설치를 판단할 수 있습니다.",
  },
];

function GuidePanel({ onClose }) {
  return (
    <SidePanel
      title="이용 안내"
      subtitle="서비스 이용 과정을 단계별로 확인해보세요."
      onClose={onClose}
    >
      <ol className={styles.steps}>
        {STEPS.map(({ title, description }, index) => (
          <li key={title} className={styles.step}>
            <span className={styles.stepNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.stepTitle}>{title}</h3>
            <p className={styles.stepDescription}>{description}</p>
          </li>
        ))}
      </ol>
    </SidePanel>
  );
}

export default GuidePanel;
