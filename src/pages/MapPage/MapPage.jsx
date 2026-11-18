import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";
import useViewportSize from "../../hooks/useViewportSize";
import CampusMap from "../../components/map/CampusMap";
import LoadingScreen from "../../components/map/LoadingScreen";
import { enterBuilding, useSim } from "../../state/simulatorStore";
import styles from "./MapPage.module.css";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 836;
const HEADER_HEIGHT = 64;
const RESPONSIVE_WIDTH = 1024;

function MapPage() {
  const navigate = useNavigate();
  const [loadingBuilding, setLoadingBuilding] = useState(null);
  const viewport = useViewportSize();
  const availableHeight = viewport.height - HEADER_HEIGHT;
  const scale = Math.min(
    1,
    viewport.width / DESIGN_WIDTH,
    availableHeight / DESIGN_HEIGHT,
  );
  const stageStyle =
    viewport.width < RESPONSIVE_WIDTH
      ? undefined
      : {
          zoom: scale,
          width: viewport.contentWidth / scale,
          height: availableHeight / scale,
        };

  const handleLoaded = useCallback(() => {
    useSim.getState().set(enterBuilding(loadingBuilding.id));
    navigate("/simulator");
  }, [navigate, loadingBuilding]);

  return (
    <div className={styles.page}>
      <div className={styles.stage} style={stageStyle}>
        <button
          type="button"
          className={styles.back}
          aria-label="위치 선택으로 돌아가기"
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon className={styles.backIcon} aria-hidden="true" />
        </button>

        <div className={styles.content}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Aero MAP</h1>
            <p className={styles.description}>
              지도에서 건물을 선택해 배기 바람의 흐름과 발전 가능성을
              살펴보세요.
            </p>
          </div>

          <CampusMap onNavigate={setLoadingBuilding} />
        </div>
      </div>

      {loadingBuilding && (
        <LoadingScreen
          buildingName={loadingBuilding.name}
          onDone={handleLoaded}
        />
      )}
    </div>
  );
}

export default MapPage;
