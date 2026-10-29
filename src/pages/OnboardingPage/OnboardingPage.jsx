import { useCallback, useEffect, useState } from "react";
import { createSearchParams, useNavigate } from "react-router";
import logoSymbol from "../../assets/images/onboarding-logo.svg";
import Logo from "../../components/common/Logo";
import ConditionsPanel from "../../components/onboarding/ConditionsPanel";
import { DEFAULT_CONDITIONS } from "../../components/onboarding/conditions";
import GuidePanel from "../../components/onboarding/GuidePanel";
import LocationSelect from "../../components/onboarding/LocationSelect";
import PlanningPanel from "../../components/onboarding/PlanningPanel";
import styles from "./OnboardingPage.module.css";

const SPLASH_DURATION = 800;
const LOCATIONS = ["가톨릭대학교 성심교정"];
// 메뉴 id → 열릴 사이드 패널.
const PANELS = {
  guide: GuidePanel,
  planning: PlanningPanel,
  conditions: ConditionsPanel,
};
const GUIDE_LINKS = [
  { id: "guide", label: "이용 안내" },
  { id: "planning", label: "서비스 기획" },
  { id: "conditions", label: "계산 조건" },
];

function Brand({ variant }) {
  return (
    <div className={styles[variant]}>
      <img src={logoSymbol} alt="" className={styles.symbol} />
      <h1 className={styles.title}>
        <Logo className={styles.logo} />
      </h1>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [openPanel, setOpenPanel] = useState(null);
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const closePanel = useCallback(() => setOpenPanel(null), []);
  const Panel = PANELS[openPanel];

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // 새로고침해도 유지되도록 선택한 위치는 URL 쿼리(?location=)로 넘기고,
  // 계산 조건은 시뮬레이터에서 useLocation().state.conditions로 받는다.
  const handleSubmit = (location) => {
    navigate(
      {
        pathname: "/simulator",
        search: createSearchParams({ location }).toString(),
      },
      { state: { conditions } },
    );
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {showSplash ? (
          <Brand variant="splash" />
        ) : (
          <div className={styles.content}>
            <Brand variant="brand" />

            <nav className={styles.guide}>
              {GUIDE_LINKS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.guideLink}
                  aria-expanded={openPanel === id}
                  onClick={() =>
                    setOpenPanel((current) => (current === id ? null : id))
                  }
                >
                  {label}
                </button>
              ))}
            </nav>

            <LocationSelect options={LOCATIONS} onSubmit={handleSubmit} />
          </div>
        )}
      </main>

      {Panel && (
        <Panel
          onClose={closePanel}
          conditions={conditions}
          onApply={setConditions}
        />
      )}
    </div>
  );
}

export default OnboardingPage;
