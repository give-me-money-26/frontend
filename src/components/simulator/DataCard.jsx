import dataDivider from "../../assets/icons/data-divider.svg";
import graphCurve from "../../assets/icons/graph-curve.svg";
import graphCurveSource from "../../assets/icons/graph-curve.svg?raw";
import graphGrid from "../../assets/icons/graph-grid.svg";
import graphGrid0 from "../../assets/icons/graph-grid-0.svg";
import graphGrid5 from "../../assets/icons/graph-grid-5.svg";
import graphGridTop from "../../assets/icons/graph-grid-top.svg";
import graphMarkerInner from "../../assets/icons/graph-marker-inner.svg";
import graphMarkerLine from "../../assets/icons/graph-marker-line.svg";
import graphMarkerMiddle from "../../assets/icons/graph-marker-middle.svg";
import graphMarkerOuter from "../../assets/icons/graph-marker-outer.svg";
import ventDivider from "../../assets/icons/vent-divider.svg";
import { BUILDINGS } from "../../data/campus";
import { HOUR_RANGE, WIND_RANGE } from "../../data/wind";
import { useSim } from "../../state/simulatorStore";
import Slider from "../common/Slider";
import BuildingSelect from "./BuildingSelect";
import styles from "./DataCard.module.css";

const HOUR_ANCHORS = [
  [10, 82],
  [15, 205],
  [22, 336],
];

const GRID_ROWS = [
  { label: "20", line: graphGridTop, className: styles.gridTop },
  { label: "15", line: graphGrid, className: styles.grid15 },
  { label: "10", line: graphGrid, className: styles.grid10 },
  { label: "5", line: graphGrid5, className: styles.grid5 },
  { label: "0", line: graphGrid0, className: styles.grid0 },
];

const CURVE_OFFSET_X = -14;
const CURVE_OFFSET_Y = 59;
const CURVE_BASELINE = 61;
const MARKER_ABOVE_CURVE = 4;
const MARKER_LINE_BOTTOM = 112.5;
const GRID_ZERO_Y = CURVE_BASELINE + CURVE_OFFSET_Y;
const GRID_PX_PER_UNIT = 17 / 5;

function parseCurveSegments(svg) {
  const d = svg.match(/id="Vector_2" d="([^"]+)"/)[1];
  const tokens = d.match(/[MCH]|-?\d*\.?\d+/g);
  const segments = [];
  let command;
  let x = 0;
  let y = 0;
  let i = 0;
  const next = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/[MCH]/.test(tokens[i])) command = tokens[i++];
    if (command === "M") {
      x = next();
      y = next();
    } else if (command === "C") {
      const segment = [x, y, next(), next(), next(), next(), next(), next()];
      segments.push(segment);
      [x, y] = segment.slice(6);
    } else if (command === "H") {
      const endX = next();
      segments.push([x, y, x, y, endX, y, endX, y]);
      x = endX;
    }
  }
  return segments;
}

const CURVE_SEGMENTS = parseCurveSegments(graphCurveSource);

const bezier = (t, p0, p1, p2, p3) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

function curveYAt(x) {
  const segment = CURVE_SEGMENTS.find(([x0, , , , , , x1]) => x >= x0 && x <= x1);
  if (!segment) return CURVE_BASELINE;

  const [x0, y0, cx1, cy1, cx2, cy2, x1, y1] = segment;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 20; step++) {
    const mid = (low + high) / 2;
    if (bezier(mid, x0, cx1, cx2, x1) < x) low = mid;
    else high = mid;
  }
  return bezier((low + high) / 2, y0, cy1, cy2, y1);
}

function hourToX(hour) {
  for (let i = 1; i < HOUR_ANCHORS.length; i++) {
    const [h0, x0] = HOUR_ANCHORS[i - 1];
    const [h1, x1] = HOUR_ANCHORS[i];
    if (hour <= h1) return x0 + ((hour - h0) / (h1 - h0)) * (x1 - x0);
  }
  return HOUR_ANCHORS[HOUR_ANCHORS.length - 1][1];
}

const curveCardYAt = (cardX) => curveYAt(cardX - CURVE_OFFSET_X) + CURVE_OFFSET_Y;

const curveValueAt = (cardX) =>
  Math.max(0, (GRID_ZERO_Y - curveCardYAt(cardX)) / GRID_PX_PER_UNIT).toFixed(1);

const densityY = (density) => GRID_ZERO_Y - density * GRID_PX_PER_UNIT;

function seriesPath(series) {
  const points = series.map(({ hour, densityWM2 }) => [
    hourToX(hour),
    densityY(densityWM2),
  ]);
  const at = (i) => points[Math.max(0, Math.min(points.length - 1, i))];
  return points
    .map(([x, y], i) => {
      if (!i) return `M${x} ${y}`;
      const [x0, y0] = at(i - 2);
      const [x1, y1] = at(i - 1);
      const [x3, y3] = at(i + 1);
      return `C${x1 + (x - x0) / 6} ${y1 + (y - y0) / 6} ${x - (x3 - x1) / 6} ${y - (y3 - y1) / 6} ${x} ${y}`;
    })
    .join("");
}

function StatBox({ label, value, unit, tall = false }) {
  return (
    <div className={`${styles.statBox} ${tall ? styles.statBoxTall : ""}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>
        <span className={styles.statNumber}>{value}</span>
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </p>
    </div>
  );
}

function DataCard({
  priority = "1순위",
  power = "123",
  maxEnergyDensity = "17.1",
  maxTime = "15:00",
  graphValue,
  efficiencyNote = "변환 효율 25% · 일 8시간 운전",
  optimization = "건물 사이 통로와 주변 흐름을 함께 살펴 배기구와 터빈의 거리를 조절하세요.",
  onCommit,
}) {
  const hour = useSim((s) => s.hour);
  const windSpeedMS = useSim((s) => s.windSpeedMS);
  const detail = useSim((s) => s.buildingDetail);
  const buildingId = useSim((s) => s.buildingId);
  const { vent } = BUILDINGS.find(({ id }) => id === buildingId);
  const series = detail?.hourlySeries;
  const setSim = useSim((s) => s.set);
  const point = series?.find((p) => p.hour === hour);
  const markerX = hourToX(hour);
  const markerY =
    (point ? densityY(point.densityWM2) : curveCardYAt(markerX)) -
    MARKER_ABOVE_CURVE;
  const displayValue =
    graphValue ?? (point ? point.densityWM2.toFixed(1) : curveValueAt(markerX));
  const linePath = series && seriesPath(series);
  const peak = series?.reduce((a, b) => (b.densityWM2 > a.densityWM2 ? b : a));

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>DATA CARD</h2>

      <div className={styles.card}>
        <div className={styles.list}>
          <div className={`${styles.item} ${styles.buildingItem}`}>
            <div className={styles.buildingInfo}>
              <span className={styles.buildingLabel}>건물</span>
              <BuildingSelect />
            </div>
            <img src={dataDivider} alt="" className={styles.buildingDivider} />
            <div className={styles.buildingInfo}>
              <span className={styles.buildingLabel}>설치 우선순위</span>
              <span className={styles.buildingValue}>
                {detail ? `${detail.priorityRank}순위` : priority}
              </span>
            </div>
          </div>

          <div className={`${styles.item} ${styles.statusItem}`}>
            <h3 className={styles.itemTitle}>현재 상태</h3>
            <div className={styles.statRow}>
              <StatBox
                label="추정 풍속"
                value={windSpeedMS.toFixed(1)}
                unit="m/s"
              />
              <StatBox label="발전량" value={power} unit="W" />
            </div>
            <Slider
              className={styles.control}
              label="풍속 조절"
              value={windSpeedMS}
              min={WIND_RANGE[0]}
              max={WIND_RANGE[1]}
              step={0.1}
              onChange={(next) => setSim({ windSpeedMS: next })}
              onCommit={onCommit}
            />
          </div>

          <div className={`${styles.item} ${styles.maxItem}`}>
            <h3 className={styles.itemTitle}>최대치</h3>
            <div className={styles.statRow}>
              <StatBox
                label="최대 에너지 밀도"
                value={peak ? peak.densityWM2.toFixed(1) : maxEnergyDensity}
                unit="W/m²"
                tall
              />
              <StatBox
                label="최대 발생 시각"
                value={peak ? `${peak.hour}:00` : maxTime}
                tall
              />
            </div>
          </div>

          <div className={`${styles.item} ${styles.graphItem}`}>
            <h3 className={styles.itemTitle}>시간대별 흐름 그래프 (w/m²)</h3>
            <div className={styles.graph}>
              <div className={styles.gridRows}>
                {GRID_ROWS.map((row) => (
                  <div key={row.label} className={`${styles.gridRow} ${row.className}`}>
                    <span className={styles.gridLabel}>{row.label}</span>
                    <img src={row.line} alt="" className={styles.gridLine} />
                  </div>
                ))}
              </div>
              <span className={`${styles.hourLabel} ${styles.hour10}`}>10시</span>
              <span className={`${styles.hourLabel} ${styles.hour15}`}>15시</span>
              <span className={`${styles.hourLabel} ${styles.hour22}`}>22시</span>
              {linePath ? (
                <svg className={styles.series} aria-hidden="true">
                  <defs>
                    <linearGradient
                      id="seriesFill"
                      x1="0"
                      y1={densityY(20)}
                      x2="0"
                      y2={GRID_ZERO_Y}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="var(--color-accent)" />
                      <stop
                        offset="0.75"
                        stopColor="var(--color-accent)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="1"
                        stopColor="var(--color-accent)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${linePath}V${GRID_ZERO_Y}H${hourToX(series[0].hour)}Z`}
                    fill="url(#seriesFill)"
                  />
                  <path d={linePath} className={styles.seriesLine} />
                </svg>
              ) : (
                <img src={graphCurve} alt="" className={styles.graphCurve} />
              )}
            </div>
            <div className={styles.marker} style={{ left: markerX, top: markerY }}>
              <div
                className={styles.markerLineClip}
                style={{ height: Math.max(0, MARKER_LINE_BOTTOM - markerY) }}
              >
                <img src={graphMarkerLine} alt="" className={styles.markerLine} />
              </div>
              <img src={graphMarkerOuter} alt="" className={styles.markerOuter} />
              <img src={graphMarkerMiddle} alt="" className={styles.markerMiddle} />
              <img src={graphMarkerInner} alt="" className={styles.markerInner} />
              <span className={styles.markerValue}>{displayValue}</span>
            </div>
            <Slider
              className={styles.control}
              label="기준 시간"
              value={hour}
              min={HOUR_RANGE[0]}
              max={HOUR_RANGE[1]}
              onChange={(next) => setSim({ hour: next })}
              onCommit={onCommit}
            />
          </div>

          <div className={`${styles.item} ${styles.ventItem}`}>
            <h3 className={styles.itemTitle}>배기구 위치 및 정보</h3>
            <p className={styles.ventNote}>{efficiencyNote}</p>
            <div className={styles.ventBox}>
              <p className={styles.ventLocation}>{vent.location}</p>
              <img src={ventDivider} alt="" className={styles.ventDivider} />
              <dl className={styles.ventGrid}>
                <div className={styles.ventCell}>
                  <dt>이격거리</dt>
                  <dd>{vent.distanceM.toFixed(1)} m</dd>
                </div>
                <div className={styles.ventCell}>
                  <dt>개구면적</dt>
                  <dd>{vent.areaM2.toFixed(2)} ㎡</dd>
                </div>
                <div className={styles.ventCell}>
                  <dt>설치높이</dt>
                  <dd>{vent.heightM.toFixed(1)} m</dd>
                </div>
                <div className={`${styles.ventCell} ${styles.ventCellSpread}`}>
                  <dt>배출각</dt>
                  <dd>{vent.angleDegrees} º</dd>
                </div>
              </dl>
            </div>
            <p className={styles.ventFootnote}>
              * 시뮬레이션 가정값 · 현장 실측 전 임시값
            </p>
          </div>

          <div className={`${styles.item} ${styles.optimizeItem}`}>
            <h3 className={styles.itemTitle}>최적화 방향</h3>
            <p className={styles.optimizeText}>
              {detail?.advice ?? optimization}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DataCard;
