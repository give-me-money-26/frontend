import { useEffect, useState } from "react";
import { createSearchParams, useNavigate } from "react-router";
import logoSymbol from "../../assets/images/onboarding-logo.svg";
import Logo from "../../components/common/Logo";
import LocationSelect from "../../components/onboarding/LocationSelect";
import styles from "./OnboardingPage.module.css";

const SPLASH_DURATION = 800;
const LOCATIONS = ["가톨릭대학교 성심교정"];
const GUIDE_LINKS = ["이용 안내", "서비스 기획", "계산 조건"];

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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // 새로고침해도 유지되도록 선택한 위치는 URL 쿼리(?location=)로 넘긴다.
  const handleSubmit = (location) => {
    navigate({
      pathname: "/simulator",
      search: createSearchParams({ location }).toString(),
    });
  };

  return (
    <div className={styles.page}>
      {showSplash ? (
        <Brand variant="splash" />
      ) : (
        <div className={styles.content}>
          <Brand variant="brand" />

          <nav className={styles.guide}>
            {GUIDE_LINKS.map((label) => (
              <button key={label} type="button" className={styles.guideLink}>
                {label}
              </button>
            ))}
          </nav>

          <LocationSelect options={LOCATIONS} onSubmit={handleSubmit} />
        </div>
      )}
    </div>
  );
}

export default OnboardingPage;
