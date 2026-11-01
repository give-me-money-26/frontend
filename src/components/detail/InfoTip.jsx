import { useEffect, useId, useRef, useState } from "react";
import information from "../../assets/icons/information.png";
import popoverClose from "../../assets/icons/popover-close.svg";
import styles from "./InfoTip.module.css";

function InfoTip({ label, items, className, popoverClassName, iconSize = 20 }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const popoverId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (e) => {
      if (!rootRef.current.contains(e.target)) setIsOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={popoverId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={information} alt="" style={{ width: iconSize, height: iconSize }} />
      </button>

      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={label}
          className={`${styles.popover} ${popoverClassName ?? ""}`}
        >
          <dl className={styles.list}>
            {items.map(({ title, description }) => (
              <div key={title} className={styles.item}>
                <dt>{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className={styles.close}
            aria-label="닫기"
            onClick={() => setIsOpen(false)}
          >
            <img src={popoverClose} alt="" />
          </button>
        </div>
      )}
    </div>
  );
}

export default InfoTip;
