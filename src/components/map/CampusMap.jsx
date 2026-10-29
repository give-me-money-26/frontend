import { useEffect, useId, useState } from "react";
import locationIcon from "../../assets/icons/location.svg";
import mapImage from "../../assets/images/map.svg";
import BuildingPopup from "./BuildingPopup";
import { BUILDINGS, CAMPUS, MAP_HEIGHT, MAP_WIDTH } from "./campus";
import styles from "./CampusMap.module.css";

// 지도 좌표 → 지도 크기에 따라 함께 줄어드는 % 위치
const toPosition = ([x, y]) => ({
  left: `${(x / MAP_WIDTH) * 100}%`,
  top: `${(y / MAP_HEIGHT) * 100}%`,
});

// 건물(이름표·영역)을 누르면 강조와 정보 팝업을 띄운다. 빈 곳을 누르거나 Esc로 닫는다.
function CampusMap({ onNavigate }) {
  // 강조 테두리 그라데이션·그림자 id (useId의 특수문자는 url(#...)에서 문제가 돼 뺀다)
  const uid = useId().replace(/[^\w-]/g, "");
  const gradientId = `outline-gradient-${uid}`;
  const shadowId = `outline-shadow-${uid}`;
  const [selectedId, setSelectedId] = useState(null);
  const selected = BUILDINGS.find(({ id }) => id === selectedId);

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
        style={{
          "--outline-stroke": `url(#${gradientId})`,
          "--outline-shadow": `url(#${shadowId})`,
        }}
      >
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor="#68afb1" />
            <stop offset="100%" stopColor="#2c8d98" />
          </radialGradient>
          {/* Figma 바깥쪽 그림자 2개(±5, 흐림 15). 도형 안쪽은 잘라내서 채움이 뿌옇게 덮이지 않게 한다. */}
          <filter
            id={shadowId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/* 채움이 반투명이라 알파를 1로 올린 도형 모양(mask)을 기준으로 쓴다. */}
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
            <feFlood floodColor="#6bc4c5" />
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
