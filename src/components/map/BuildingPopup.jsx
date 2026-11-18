import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import styles from "./BuildingPopup.module.css";

const DATA_STATUS_LABELS = {
  PRELIMINARY_DATA: "테스트 데이터",
};

const toNote = ({ dataStatus, priorityRank }) =>
  [DATA_STATUS_LABELS[dataStatus], `설치 검토 ${priorityRank}순위`]
    .filter(Boolean)
    .join(" · ");

function BuildingPopup({ building, summary, style, onClose, onNavigate }) {
  const { name } = building;

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
          <span>{toNote(summary)}</span>
          <span>
            최대 에너지 밀도{" "}
            <strong className={styles.value}>
              {summary.peakDensityWM2.toFixed(1)} W/m²
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
