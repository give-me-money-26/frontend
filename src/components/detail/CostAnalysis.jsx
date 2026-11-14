import { Fragment, useState } from "react";
import costDivider from "../../assets/icons/cost-divider.svg";
import dropdownDivider from "../../assets/icons/dropdown-divider.svg";
import dropdownTriangle from "../../assets/icons/dropdown-triangle.svg";
import { PAYBACK_LIMIT_YEARS } from "../../utils/turbine";
import InfoTip from "./InfoTip";
import styles from "./CostAnalysis.module.css";

const PAYBACK_INFO = [
  {
    title: "단순 투자 회수 기간",
    description: "= (터빈 가격 + 설치 비용) ÷ 연간 절감액",
  },
];

function formatPayback(years) {
  if (years == null) return { value: "-", unit: "년", isLow: false };
  if (years >= PAYBACK_LIMIT_YEARS) {
    return { value: PAYBACK_LIMIT_YEARS, unit: "년 이상", isLow: true };
  }
  return { value: years.toFixed(1), unit: "년", isLow: false };
}

function CostAnalysis({ turbines, selected, onSelect, paybackYears }) {
  const [isOpen, setIsOpen] = useState(false);
  const payback = formatPayback(paybackYears);

  const handleSelect = (next) => {
    onSelect(next);
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        <section className={styles.costCard}>
          <div className={styles.costBody}>
            <div className={styles.costContent}>
              <div className={styles.costPrice}>
                <div className={styles.costItem}>
                  <span className={styles.costLabel}>터빈 가격</span>
                  <p className={styles.amount}>
                    <span className={styles.value}>
                      {selected.priceKrw.toLocaleString("ko-KR")}
                    </span>
                    <span className={styles.unit}>원</span>
                  </p>
                </div>
                <img src={costDivider} alt="" />
              </div>
              <div className={`${styles.costItem} ${styles.costInstall}`}>
                <span className={styles.costLabel}>터빈 설치 비용</span>
                <p className={styles.amount}>
                  <span className={styles.value}>
                    {selected.installCostKrw.toLocaleString("ko-KR")}
                  </span>
                  <span className={styles.unit}>원</span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.costHeader}>
            <h3 className={styles.costTitle}>
              비용 분석
              <span className={styles.assumed}>가정값</span>
            </h3>
            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownButton}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <span>{selected.name}</span>
                <span className={styles.triangle}>
                  <img src={dropdownTriangle} alt="" />
                </span>
              </button>
              {isOpen && (
                <ul className={styles.menu}>
                  {turbines.map((item, index) => (
                    <Fragment key={item.name}>
                      {index > 0 && (
                        <li className={styles.menuDivider} aria-hidden="true">
                          <img src={dropdownDivider} alt="" />
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          className={styles.menuItem}
                          aria-pressed={item === selected}
                          onClick={() => handleSelect(item)}
                        >
                          {item.name}
                        </button>
                      </li>
                    </Fragment>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className={styles.paybackCard}>
          <div
            className={`${styles.payback} ${payback.isLow ? styles.paybackLow : ""}`}
          >
            <h3 className={styles.paybackTitle}>투자 회수 기간</h3>
            <p className={styles.amount}>
              <span className={styles.paybackValue}>{payback.value}</span>
              <span className={styles.paybackUnit}>{payback.unit}</span>
            </p>
            {payback.isLow && (
              <span className={styles.lowText}>경제성 낮음</span>
            )}
          </div>
          <InfoTip
            label="투자 회수 기간 정보"
            items={PAYBACK_INFO}
            iconSize={22}
            className={styles.info}
            popoverClassName={styles.infoPopover}
          />
        </section>
      </div>
    </div>
  );
}

export default CostAnalysis;
