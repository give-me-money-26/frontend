import { Fragment, useState } from "react";
import costDivider from "../../assets/icons/cost-divider.svg";
import dropdownDivider from "../../assets/icons/dropdown-divider.svg";
import dropdownTriangle from "../../assets/icons/dropdown-triangle.svg";
import InfoTip from "./InfoTip";
import styles from "./CostAnalysis.module.css";

const PAYBACK_INFO = [
  { title: "단순 투자 회수 기간", description: "= 설치비 / 연간 절감액" },
];

function CostAnalysis({ turbines, payback }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const turbine = selected ?? turbines[0];

  const handleSelect = (next) => {
    setSelected(next);
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
                    <span className={styles.value}>{turbine.price}</span>
                    <span className={styles.unit}>원</span>
                  </p>
                </div>
                <img src={costDivider} alt="" />
              </div>
              <div className={`${styles.costItem} ${styles.costInstall}`}>
                <span className={styles.costLabel}>터빈 설치 비용</span>
                <p className={styles.amount}>
                  <span className={styles.value}>{turbine.installCost}</span>
                  <span className={styles.unit}>원</span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.costHeader}>
            <h3 className={styles.costTitle}>비용 분석</h3>
            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownButton}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <span>{selected ? selected.name : "터빈 종류"}</span>
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
          <div className={styles.payback}>
            <h3 className={styles.paybackTitle}>투자 회수 기간</h3>
            <p className={styles.amount}>
              <span className={styles.paybackValue}>{payback}</span>
              <span className={styles.paybackUnit}>일</span>
            </p>
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
