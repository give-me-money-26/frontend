import { useEffect, useRef } from "react";
import styles from "./Slider.module.css";

function Slider({
  label,
  valueText,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  className,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!onCommit) return undefined;
    const input = inputRef.current;
    const handleCommit = () => onCommit(Number(input.value));
    input.addEventListener("change", handleCommit);
    return () => input.removeEventListener("change", handleCommit);
  }, [onCommit]);

  return (
    <div className={[styles.slider, className].filter(Boolean).join(" ")}>
      <p className={styles.header}>
        <span>{label}</span>
        {valueText && <span className={styles.value}>{valueText}</span>}
      </p>
      <input
        ref={inputRef}
        type="range"
        className={styles.input}
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--ratio": (value - min) / (max - min) }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export default Slider;
