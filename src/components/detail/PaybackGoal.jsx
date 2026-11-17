import { useState } from "react";
import { PAYBACK_LIMIT_YEARS } from "../../utils/turbine";
import styles from "./PaybackGoal.module.css";

const PRESET_YEARS = [10, 20, 30];

function formatYears(years) {
  if (years >= PAYBACK_LIMIT_YEARS) return `${PAYBACK_LIMIT_YEARS}년 이상`;
  return `${years.toFixed(1)}년`;
}

function formatKrw(value) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function PaybackGoal({ paybackYears, areaM2, totalCostKrw }) {
  const [preset, setPreset] = useState(PRESET_YEARS[0]);
  const [custom, setCustom] = useState("");

  const customYears = Number(custom);
  const isCustom = custom !== "" && customYears > 0;
  const target = isCustom ? customYears : preset;

  const hasResult = paybackYears != null;
  const isAchieved = hasResult && paybackYears <= target;
  const factor = hasResult ? paybackYears / target : null;

  const handlePreset = (years) => {
    setPreset(years);
    setCustom("");
  };

  const handleCustom = (e) => {
    const next = e.target.value.replace(/[^\d.]/g, "");
    setCustom(next);
  };

  const renderBody = () => {
    if (!hasResult) {
      return (
        <p className={styles.summaryLine}>
          시뮬레이션 결과를 불러오면 목표 달성 조건을 계산합니다.
        </p>
      );
    }

    if (isAchieved) {
      return (
        <>
          <div className={styles.summary}>
            <p className={styles.summaryLine}>
              현재 조건에서 예상 투자 회수기간은{" "}
              <strong className={styles.emphasis}>
                {formatYears(paybackYears)}
              </strong>
              입니다.
            </p>
            <p className={styles.summaryLine}>
              목표 회수기간인 {target}년을 이미 충족합니다.
            </p>
          </div>
          <div className={styles.conclusion}>
            현재 조건으로도 목표 회수기간 내 투자비 회수가 가능합니다.
          </div>
        </>
      );
    }

    const requiredArea = areaM2 * factor;
    const requiredCost = Math.round(totalCostKrw / factor / 10) * 10;
    const costPercent = Math.round(100 / factor);

    return (
      <>
        <div className={styles.summary}>
          <p className={styles.summaryLine}>
            현재 조건에서 예상 투자 회수기간은{" "}
            <strong className={styles.emphasis}>
              {formatYears(paybackYears)}
            </strong>
            입니다.
          </p>
          <p className={styles.summaryLine}>
            목표 회수기간인 {target}년을 달성하려면 경제성이 현재보다 약{" "}
            <strong className={styles.emphasis}>{factor.toFixed(1)}배</strong>{" "}
            개선되어야 합니다.
          </p>
        </div>

        <div className={styles.options}>
          <div className={styles.cards}>
            <div className={styles.card}>
              <h4 className={styles.cardTitle}>유효 회수면적 확대 시</h4>
              <div className={styles.cardBody}>
                <p className={styles.cardValue}>
                  <span className={styles.cardLabel}>필요 면적 약</span>
                  <span className={styles.number}>
                    {requiredArea.toFixed(1)}
                  </span>
                  <span className={styles.unit}>㎡</span>
                  <span className={styles.badge}>
                    현재 {areaM2}㎡ → 약 {requiredArea.toFixed(1)}㎡
                  </span>
                </p>
                <p className={styles.cardText}>
                  현장에서 실제 적용 가능한 배기구 면적을 확인해 보세요.
                </p>
              </div>
            </div>

            <div className={styles.card}>
              <h4 className={styles.cardTitle}>초기비용 절감 시</h4>
              <div className={styles.cardBody}>
                <p className={styles.cardValue}>
                  <span className={styles.cardLabel}>필요 비용 현재의 약</span>
                  <span className={styles.number}>{costPercent}</span>
                  <span className={styles.unit}>% 이하</span>
                  <span className={styles.badge}>
                    현재 {formatKrw(totalCostKrw)} → 약{" "}
                    {formatKrw(requiredCost)}
                  </span>
                </p>
                <p className={styles.cardText}>
                  터빈 및 설치 총비용을 이만큼 낮춰야 합니다.
                  <br />
                  대체 장비, 설치 방식 또는 지원금 적용 가능성을 검토해 보세요.
                </p>
              </div>
            </div>
          </div>
          <p className={styles.note}>
            각 조건은 다른 조건이 동일하다고 가정해 개별 계산한 값입니다. 여러
            조건을 함께 개선하면 목표를 달성하기 위한 각각의 변화 폭은 줄어들 수
            있습니다.
          </p>
        </div>

        <div className={styles.conclusion}>
          현재 조건에서는 경제성이 낮지만, 현장 면적과 설치비용을 추가로 확인할
          가치가 있습니다.
        </div>
      </>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{target}년 내 투자비 회수를 위한 조건</h3>
        <span className={styles.targetLabel}>목표 회수기간</span>
        <div className={styles.chips}>
          {PRESET_YEARS.map((years) => (
            <button
              key={years}
              type="button"
              className={styles.chip}
              aria-pressed={!isCustom && preset === years}
              onClick={() => handlePreset(years)}
            >
              {years}년
            </button>
          ))}
          <input
            type="text"
            inputMode="decimal"
            className={styles.customInput}
            placeholder="직접 입력"
            aria-label="목표 회수기간 직접 입력 (년)"
            value={custom}
            onChange={handleCustom}
          />
        </div>
      </div>

      <div className={styles.body}>{renderBody()}</div>
    </section>
  );
}

export default PaybackGoal;
