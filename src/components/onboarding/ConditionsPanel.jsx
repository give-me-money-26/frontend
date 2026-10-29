import { useId, useState } from "react";
import { DEFAULT_CONDITIONS } from "./conditions";
import SidePanel from "./SidePanel";
import styles from "./ConditionsPanel.module.css";

const FIELDS = [
  { name: "area", label: "회수 면적 (m²)" },
  { name: "efficiency", label: "변환 효율 (%)" },
  { name: "dailyHours", label: "하루 운전시간 (h)" },
  { name: "annualDays", label: "연간 운전일 (일)" },
  { name: "electricityPrice", label: "전기요금 가정 (원/kWh)" },
  { name: "emissionFactor", label: "배출계수 가정 (kgCO₂/kWh)" },
  { name: "installCost", label: "터빈 + 설치비 (원)", placeholder: "미입력" },
];

function ConditionsPanel({
  onClose,
  conditions = DEFAULT_CONDITIONS,
  onApply,
}) {
  const idPrefix = useId();
  const [values, setValues] = useState(conditions);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply?.(values);
    onClose();
  };

  return (
    <SidePanel
      title="계산 조건"
      subtitle={
        "면적과 효율을 바꿔 설치 시나리오를 비교하세요.\n초기값은 예시 가정입니다."
      }
      onClose={onClose}
    >
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          {FIELDS.map(({ name, label, placeholder }) => (
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
                placeholder={placeholder}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => setValues(DEFAULT_CONDITIONS)}
          >
            예시 조건 복원
          </button>
          <button type="submit" className={styles.applyButton}>
            계산 조건 적용
          </button>
        </div>
      </form>
    </SidePanel>
  );
}

export default ConditionsPanel;
