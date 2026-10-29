import { useEffect, useId } from "react";
import VerticalBarIcon from "../../assets/icons/vertical-bar.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import useViewportSize from "../../hooks/useViewportSize";
import styles from "./SidePanel.module.css";

const DESIGN_HEIGHT = 900;

function SidePanel({ title, subtitle, onClose, children }) {
  const titleId = useId();
  const { height: viewportHeight } = useViewportSize();
  const scale = Math.min(1, viewportHeight / DESIGN_HEIGHT);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <aside
      className={styles.panel}
      style={{ zoom: scale, height: viewportHeight / scale }}
      aria-labelledby={titleId}
    >
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.close}
          aria-label={`${title} 닫기`}
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </button>

        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            <VerticalBarIcon aria-hidden="true" />
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        {children}
      </div>
    </aside>
  );
}

export default SidePanel;
