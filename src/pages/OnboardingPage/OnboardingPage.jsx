import { useCallback, useEffect, useState } from "react";
import { createSearchParams, useNavigate } from "react-router";
import logoSymbol from "../../assets/images/logo-symbol.svg";
import Logo from "../../components/common/Logo";
import ConditionsPanel from "../../components/onboarding/ConditionsPanel";
import { DEFAULT_CONDITIONS } from "../../components/onboarding/conditions";
import GuidePanel from "../../components/onboarding/GuidePanel";
import LocationSelect from "../../components/onboarding/LocationSelect";
import PlanningPanel from "../../components/onboarding/PlanningPanel";
import { CAMPUS } from "../../data/campus";
import styles from "./OnboardingPage.module.css";

const SPLASH_DURATION = 800;
const LOCATIONS = [CAMPUS.name];
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (location) => {
    navigate(
      {
        pathname: "/map",
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

      {openPanel === "guide" && <GuidePanel onClose={closePanel} />}
      {openPanel === "planning" && <PlanningPanel onClose={closePanel} />}
      {openPanel === "conditions" && (
        <ConditionsPanel
          conditions={conditions}
          onApply={setConditions}
          onClose={closePanel}
        />
      )}
    </div>
  );
}

export default OnboardingPage;
