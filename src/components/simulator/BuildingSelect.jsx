import { useEffect, useRef, useState } from "react";
import DropDownIcon from "../../assets/icons/drop-down.svg?react";
import { BUILDINGS } from "../../data/campus";
import { enterBuilding, useSim } from "../../state/simulatorStore";
import styles from "./BuildingSelect.module.css";

const OPTIONS = [...BUILDINGS].sort((a, b) =>
  a.name.localeCompare(b.name, "ko"),
);

function BuildingSelect() {
  const buildingId = useSim((s) => s.buildingId);
  const setSim = useSim((s) => s.set);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const current = BUILDINGS.find(({ id }) => id === buildingId);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!selectRef.current.contains(event.target)) setIsOpen(false);
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

  const handleSelect = (id) => {
    if (id !== buildingId) setSim(enterBuilding(id));
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={styles.select}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {current?.name}
        <DropDownIcon aria-hidden="true" />
      </button>

      {isOpen && (
        <ul className={styles.options} role="listbox">
          {OPTIONS.map(({ id, name }) => (
            <li key={id} role="option" aria-selected={id === buildingId}>
              <button
                type="button"
                className={styles.option}
                onClick={() => handleSelect(id)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BuildingSelect;
