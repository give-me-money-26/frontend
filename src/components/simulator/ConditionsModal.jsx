import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import VerticalBarIcon from "../../assets/icons/vertical-bar.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import useDesignScale from "../../hooks/useDesignScale";
import { defaultConditions, useSim } from "../../state/simulatorStore";
import styles from "./ConditionsModal.module.css";

const FIELDS = [
  { name: "collectionAreaM2", label: "회수 면적 (m²)" },
  { name: "efficiencyPercent", label: "변환 효율 (%)" },
  { name: "operatingHoursPerDay", label: "하루 운전시간 (h)" },
  { name: "operatingDaysPerYear", label: "연간 운전일 (일)" },
  { name: "tariffKrwPerKwh", label: "전기요금 가정 (원/kWh)" },
  { name: "carbonFactorKgPerKwh", label: "배출계수 가정 (kgCO₂/kWh)" },
];

const toInputs = (conditions) =>
  Object.fromEntries(
    Object.entries(conditions).map(([name, value]) => [
      name,
      value === null ? "" : String(value),
    ]),
  );

const toConditions = (inputs) =>
  Object.fromEntries(
    Object.entries(inputs).map(([name, value]) => [
      name,
      value === "" ? null : Number(value),
    ]),
  );

function ConditionsModal({ onClose }) {
  const idPrefix = useId();
  const titleId = `${idPrefix}-title`;
  const scale = useDesignScale();
  const defaults = useSim(defaultConditions);
  const [values, setValues] = useState(() =>
    toInputs(useSim.getState().conditions ?? defaults),
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    useSim.getState().set({ conditions: toConditions(values), result: null });
    onClose();
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        style={{ zoom: scale }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={styles.close}
          aria-label="계산 조건 닫기"
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </button>

        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            <VerticalBarIcon aria-hidden="true" />
            계산 조건
          </h2>
          <p className={styles.subtitle}>
            면적과 효율을 바꿔 설치 시나리오를 비교하세요.
            <br />
            초기값은 예시 가정입니다.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.card}>
            {FIELDS.map(({ name, label }) => (
              <div key={name} className={styles.field}>
                <label htmlFor={`${idPrefix}-${name}`} className={styles.label}>
                  {label}
                </label>
                <input
                  id={`${idPrefix}-${name}`}
                  name={name}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  className={styles.input}
                  value={values[name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => setValues(toInputs(defaults))}
            >
              예시 조건 복원
            </button>
            <button type="submit" className={styles.applyButton}>
              계산 조건 적용
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default ConditionsModal;
