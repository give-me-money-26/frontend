import { Fragment, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import guideAdminIcon from "../../assets/icons/guide-admin.svg";
import guideInfoIcon from "../../assets/icons/guide-info.png";
import guidePlanningIcon from "../../assets/icons/guide-planning.png";
import logoSymbol from "../../assets/images/logo-symbol.svg";
import Logo from "../../components/common/Logo";
import GuidePanel from "../../components/onboarding/GuidePanel";
import LocationSelect from "../../components/onboarding/LocationSelect";
import PlanningPanel from "../../components/onboarding/PlanningPanel";
import { CAMPUS } from "../../data/campus";
import styles from "./OnboardingPage.module.css";

const SPLASH_DURATION = 800;
const LOCATIONS = [CAMPUS.name];
const GUIDE_LINKS = [
  { id: "guide", label: "이용 안내", icon: guideInfoIcon, iconGap: 6 },
  { id: "planning", label: "서비스 기획", icon: guidePlanningIcon, iconGap: 8 },
  {
    id: "admin",
    label: "관리자 화면",
    icon: guideAdminIcon,
    iconGap: 6,
    to: "/admin",
  },
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
  const { state } = useLocation();
  const [showSplash, setShowSplash] = useState(() => !state?.skipSplash);
  const [openPanel, setOpenPanel] = useState(null);
  const closePanel = useCallback(() => setOpenPanel(null), []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {showSplash ? (
          <Brand variant="splash" />
        ) : (
          <div className={styles.content}>
            <Brand variant="brand" />

            <nav className={styles.guide}>
              {GUIDE_LINKS.map(({ id, label, icon, iconGap, to }, index) => (
                <Fragment key={id}>
                  {index > 0 && (
                    <span className={styles.guideDivider} aria-hidden="true">
                      |
                    </span>
                  )}
                  <button
                    type="button"
                    className={styles.guideLink}
                    style={{ gap: iconGap }}
                    aria-expanded={to ? undefined : openPanel === id}
                    onClick={() =>
                      to
                        ? navigate(to)
                        : setOpenPanel((current) =>
                            current === id ? null : id,
                          )
                    }
                  >
                    <img
                      src={icon}
                      alt=""
                      width={19}
                      height={19}
                      className={styles.guideIcon}
                    />
                    {label}
                  </button>
                </Fragment>
              ))}
            </nav>

            <LocationSelect
              options={LOCATIONS}
              onSubmit={() => navigate("/map")}
            />
          </div>
        )}
      </main>

      {openPanel === "guide" && <GuidePanel onClose={closePanel} />}
      {openPanel === "planning" && <PlanningPanel onClose={closePanel} />}
    </div>
  );
}

export default OnboardingPage;
