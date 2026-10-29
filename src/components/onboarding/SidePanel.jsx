import { useEffect, useId, useState } from "react";
import VerticalBarIcon from "../../assets/icons/vertical-bar.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import styles from "./SidePanel.module.css";

// Figma 프레임 높이. 창이 이보다 낮으면 패널 전체를 비율대로 줄여 스크롤 없이 보여준다.
const DESIGN_HEIGHT = 900;

function useViewportHeight() {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return height;
}

// 온보딩 오른쪽 패널 공통 틀: 닫기 버튼, 제목·부제목, 화면 높이 맞춤.
function SidePanel({ title, subtitle, onClose, children }) {
  const titleId = useId();
  const viewportHeight = useViewportHeight();
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
