import { useEffect, useRef, useState } from "react";
import DropDownIcon from "../../assets/icons/drop-down.svg?react";
import AdminDialog from "./AdminDialog";
import { cx } from "./cx";
import { TERMS, label } from "./labels";
import { errorText, format, todaySeoul } from "./shared";

export function Term({ k, children }) {
  return (
    <span className={cx("term")} tabIndex={0}>
      {children ?? k}
      <span className={cx("tip")} role="tooltip">
        {TERMS[k]}
      </span>
    </span>
  );
}

export function Badge({ code }) {
  if (!code) return null;
  return (
    <span className={cx(`badge b-${code}`)} title={code}>
      {label(code)}
    </span>
  );
}

export function Big({ value, unit, digits = 1 }) {
  return (
    <div className={cx("big")}>
      {typeof value === "number" ? format(value, digits) : "—"}
      {unit && <small>{unit}</small>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className={cx("empty")}>
      <b>{title}</b>
      {children}
    </div>
  );
}

export function ErrorNote({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className={cx("error")} role="alert">
      {error}
      {onRetry && (
        <button type="button" className={cx("btn sm")} onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

export function SubTabs({ tabs, value, onChange }) {
  return (
    <div className={cx("subtabs")} role="tablist">
      {tabs.map(([key, text]) => (
        <button
          type="button"
          key={key}
          role="tab"
          aria-selected={value === key}
          className={cx(value === key && "on")}
          onClick={() => onChange(key)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function usePopover() {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!ref.current.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return { ref, isOpen, setIsOpen };
}

export function Dropdown({ label, value, options, onChange, placeholder }) {
  const { ref, isOpen, setIsOpen } = usePopover();
  const current = options.find(([key]) => key === value);

  const handleSelect = (key) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div className={cx("field")}>
      {label}
      <div ref={ref} className={cx("picker")}>
        <button
          type="button"
          className={cx("picker-trigger")}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{current ? current[1] : placeholder}</span>
          <DropDownIcon aria-hidden="true" />
        </button>
        {isOpen && (
          <ul className={cx("menu")} role="listbox" aria-label={label}>
            {options.map(([key, text]) => (
              <li key={key} role="option" aria-selected={key === value}>
                <button type="button" onClick={() => handleSelect(key)}>
                  {text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function BuildingSelect({ buildings, value, onChange }) {
  return (
    <Dropdown
      label="건물"
      value={value}
      options={buildings.map((b) => [b.id, b.name])}
      onChange={onChange}
    />
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n) => String(n).padStart(2, "0");

function monthDays(month) {
  const [year, index] = month.split("-").map(Number);
  const blanks = new Date(year, index - 1, 1).getDay();
  const count = new Date(year, index, 0).getDate();
  return [
    ...Array(blanks).fill(null),
    ...Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`),
  ];
}

function shiftMonth(month, step) {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(year, index - 1 + step, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function DatePicker({ label, value, onChange, min }) {
  const { ref, isOpen, setIsOpen } = usePopover();
  const today = todaySeoul();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, monthIndex] = month.split("-").map(Number);
  const isBlocked = (date) => Boolean(min) && date < min;

  const toggle = () => {
    if (!isOpen) setMonth((value || today).slice(0, 7));
    setIsOpen((open) => !open);
  };

  const pick = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className={cx("field")}>
      {label}
      <div ref={ref} className={cx("picker")}>
        <button
          type="button"
          className={cx("picker-trigger")}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={toggle}
        >
          <span className={cx(!value && "placeholder")}>
            {value || "날짜 선택"}
          </span>
          <DropDownIcon aria-hidden="true" />
        </button>
        {isOpen && (
          <div className={cx("calendar")} role="dialog" aria-label={label}>
            <div className={cx("calendar-head")}>
              <b>
                {year}년 {monthIndex}월
              </b>
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                ›
              </button>
            </div>
            <div className={cx("calendar-grid")}>
              {WEEKDAYS.map((day) => (
                <span key={day} className={cx("calendar-week")}>
                  {day}
                </span>
              ))}
              {monthDays(month).map((date, i) =>
                date ? (
                  <button
                    type="button"
                    key={date}
                    className={cx(
                      date === value && "on",
                      date === today && "today",
                    )}
                    disabled={isBlocked(date)}
                    onClick={() => pick(date)}
                  >
                    {Number(date.slice(8))}
                  </button>
                ) : (
                  <span key={`blank-${i}`} />
                ),
              )}
            </div>
            <div className={cx("calendar-foot")}>
              <button type="button" onClick={() => pick("")}>
                지우기
              </button>
              <button
                type="button"
                disabled={isBlocked(today)}
                onClick={() => pick(today)}
              >
                오늘
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CHART_WIDTH = 440;

export function AreaChart({ points, unit = "", height = 150, label: aria }) {
  if (!points.length) return null;
  const values = points.map((p) => p.y);
  const peakValue = Math.max(...values);
  const max = Math.max(peakValue, 1);
  const top = max * 1.15;
  const last = points.length - 1;
  const x = (i) => 30 + (i * (CHART_WIDTH - 45)) / Math.max(last, 1);
  const y = (value) => height - 22 - (value / top) * (height - 40);
  const line = points.map((p, i) => `${x(i)},${y(p.y)}`).join(" ");
  const peak = values.indexOf(peakValue);
  const labelStep = Math.ceil(points.length / 7);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${height}`}
      width="100%"
      role="img"
      aria-label={aria}
      className={cx("chart")}
    >
      <defs>
        <linearGradient id="adminChartArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopOpacity=".75" />
          <stop offset="1" stopOpacity=".05" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line
            className={cx("chart-grid")}
            x1="30"
            x2={CHART_WIDTH - 15}
            y1={y(max * t)}
            y2={y(max * t)}
          />
          <text className={cx("chart-axis")} x="4" y={y(max * t) + 4}>
            {format(max * t, 1)}
          </text>
        </g>
      ))}
      <polygon
        points={`${x(0)},${y(0)} ${line} ${x(last)},${y(0)}`}
        fill="url(#adminChartArea)"
      />
      <polyline className={cx("chart-line")} points={line} />
      {points.map(
        (p, i) =>
          (i % labelStep === 0 || i === last) && (
            <text
              key={i}
              className={cx("chart-axis")}
              x={x(i)}
              y={height - 6}
              textAnchor="middle"
            >
              {p.x}
            </text>
          ),
      )}
      <circle
        className={cx("chart-dot")}
        cx={x(peak)}
        cy={y(points[peak].y)}
        r="4"
      />
      <rect
        className={cx("chart-peak")}
        x={x(peak) - 24}
        y={y(points[peak].y) - 24}
        width="48"
        height="16"
        rx="8"
      />
      <text
        className={cx("chart-peak-text")}
        x={x(peak)}
        y={y(points[peak].y) - 12}
        textAnchor="middle"
      >
        {format(points[peak].y, 1)}
        {unit}
      </text>
    </svg>
  );
}

export function Bar({ value, total }) {
  return (
    <div
      className={cx("bar")}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={total}
    >
      <div style={{ width: `${(value / total) * 100}%` }} />
    </div>
  );
}

export function Drawer({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className={cx("drawer-bg")} onClick={onClose} />
      <aside
        className={cx("drawer")}
        ref={ref}
        tabIndex={-1}
        aria-label={title}
      >
        <button
          type="button"
          className={cx("x")}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
        <h2>{title}</h2>
        {children}
      </aside>
    </>
  );
}

export function ConfirmWrite({ title, rows, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <AdminDialog title={title} onClose={() => !busy && onCancel()}>
      <div className={cx("warnbox")}>
        저장하면 실제 운영 DB에 기록되고, 지울 수 없습니다. 내용을 한 번 더
        확인해 주세요. 잘못 저장한 측정은 품질을 「제외」로, 결정은 다시 바꿔
        기록을 남깁니다.
      </div>
      <div className={cx("inner confirm-rows")}>
        <dl className={cx("kv")}>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ErrorNote error={error} />
      <div className={cx("row end confirm-actions")}>
        <button
          type="button"
          className={cx("btn")}
          onClick={onCancel}
          disabled={busy}
        >
          취소
        </button>
        <button
          type="button"
          className={cx("btn pri")}
          disabled={busy}
          onClick={save}
        >
          {busy ? "저장 중…" : "저장"}
        </button>
      </div>
    </AdminDialog>
  );
}
