import { useEffect, useState } from "react";
import locationIcon from "../../assets/icons/location.svg";
import mapImage from "../../assets/images/map.webp";
import BuildingPopup from "./BuildingPopup";
import { BUILDINGS, CAMPUS, MAP_HEIGHT, MAP_WIDTH } from "../../data/campus";
import useBuildings from "../../hooks/useBuildings";
import styles from "./CampusMap.module.css";

const toPosition = ([x, y]) => ({
  "--x": `${(x / MAP_WIDTH) * 100}%`,
  "--y": `${(y / MAP_HEIGHT) * 100}%`,
});

function CampusMap({ onNavigate }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = BUILDINGS.find(({ id }) => id === selectedId);
  const buildings = useBuildings();

  useEffect(() => {
    if (!selectedId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  const handleSelect = (id) => (event) => {
    event.stopPropagation();
    setSelectedId(id);
  };

  return (
    <div className={styles.map} onClick={() => setSelectedId(null)}>
      <img
        src={mapImage}
        alt={`${CAMPUS.name} 캠퍼스 지도`}
        className={styles.image}
      />

      <svg
        className={styles.overlay}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="outline-gradient">
            <stop offset="0%" className={styles.gradientStart} />
            <stop offset="100%" className={styles.gradientEnd} />
          </radialGradient>
          <filter
            id="outline-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
              result="mask"
            />
            <feGaussianBlur in="mask" stdDeviation="7.5" result="blur" />
            <feOffset in="blur" dx="5" dy="5" result="shadowA" />
            <feOffset in="blur" dx="-5" dy="-5" result="shadowB" />
            <feMerge result="shadows">
              <feMergeNode in="shadowA" />
              <feMergeNode in="shadowB" />
            </feMerge>
            <feComposite
              in="shadows"
              in2="mask"
              operator="out"
              result="outer"
            />
            <feFlood className={styles.glow} />
            <feComposite in2="outer" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {BUILDINGS.map(({ id, outline, offset }) => (
          <path
            key={id}
            d={outline}
            transform={`translate(${offset[0]} ${offset[1]})`}
            className={
              id === selectedId
                ? `${styles.outline} ${styles.outlineActive}`
                : styles.outline
            }
            onClick={handleSelect(id)}
          />
        ))}
      </svg>

      {BUILDINGS.map(({ id, name, label }) => (
        <button
          key={id}
          type="button"
          className={
            id === selectedId
              ? `${styles.label} ${styles.labelActive}`
              : styles.label
          }
          style={toPosition(label)}
          aria-pressed={id === selectedId}
          onClick={handleSelect(id)}
        >
          {name}
        </button>
      ))}

      {selected && (
        <BuildingPopup
          building={selected}
          summary={buildings?.[selected.id]}
          style={toPosition(selected.label)}
          onClose={() => setSelectedId(null)}
          onNavigate={() => onNavigate(selected)}
        />
      )}

      <p className={styles.campus}>
        <img src={locationIcon} alt="" width={22} height={22} />
        {CAMPUS.shortName}
      </p>
    </div>
  );
}

export default CampusMap;
