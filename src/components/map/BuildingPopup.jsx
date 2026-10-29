import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import styles from "./BuildingPopup.module.css";

// 선택한 건물 이름표 바로 위에 뜨는 정보 카드
function BuildingPopup({ building, style, onClose, onNavigate }) {
  const { name, summary } = building;

  return (
    <section
      className={styles.popup}
      style={style}
      aria-label={`${name} 정보`}
      onClick={(event) => event.stopPropagation()}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <button
          type="button"
          className={styles.close}
          aria-label={`${name} 정보 닫기`}
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </button>
      </header>

      {summary ? (
        <p className={styles.meta}>
          <span>{summary.note}</span>
          <span>
            최대 에너지 밀도{" "}
            <strong className={styles.value}>
              {summary.maxEnergyDensity} W/m²
            </strong>
          </span>
        </p>
      ) : (
        <p className={styles.meta}>분석 데이터를 준비 중입니다.</p>
      )}

      <button type="button" className={styles.action} onClick={onNavigate}>
        발전량 예측 바로가기
        <ArrowRightIcon aria-hidden="true" />
      </button>
    </section>
  );
}

export default BuildingPopup;
