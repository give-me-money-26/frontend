import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";
import useViewportSize from "../../hooks/useViewportSize";
import CampusMap from "../../components/map/CampusMap";
import { CAMPUS } from "../../components/map/campus";
import styles from "./MapPage.module.css";

// Figma 프레임에서 헤더를 뺀 영역. 창이 이보다 작으면 페이지 전체를 같은 비율로 줄인다.
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 836;
const HEADER_HEIGHT = 64;

function MapPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") ?? CAMPUS.name;
  const viewport = useViewportSize();
  const availableHeight = viewport.height - HEADER_HEIGHT;
  const scale = Math.min(
    1,
    viewport.width / DESIGN_WIDTH,
    availableHeight / DESIGN_HEIGHT,
  );

  // 온보딩에서 받은 계산 조건(state)은 시뮬레이터까지 그대로 넘긴다.
  const handleNavigate = (building) => {
    navigate(
      {
        pathname: "/simulator",
        search: createSearchParams({
          location,
          building: building.name,
        }).toString(),
      },
      { state },
    );
  };

  return (
    <div className={styles.page}>
      <div
        className={styles.stage}
        style={{
          zoom: scale,
          width: viewport.width / scale,
          height: availableHeight / scale,
        }}
      >
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

          <CampusMap onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
