import { useEffect, useRef, useState } from "react";
import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import ChevronDownIcon from "../../assets/icons/chevron-down.svg?react";
import styles from "./LocationSelect.module.css";

function LocationSelect({ options, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!fieldRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={fieldRef} className={styles.field}>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{selected ?? "위치를 선택하세요"}</span>
          <ChevronDownIcon
            className={isOpen ? styles.caretOpen : undefined}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul className={styles.options} role="listbox">
            {options.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={option === selected}
              >
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className={styles.submit}
        aria-label="시작하기"
        disabled={!selected}
        onClick={() => onSubmit(selected)}
      >
        <ArrowRightIcon
          className={styles.submitIcon}
          width={24}
          height={13}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default LocationSelect;
