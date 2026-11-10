import { useRef, useState } from "react";
import tableLine from "../../assets/icons/table-line.svg";
import { MEASUREMENT_BUILDINGS, MEASUREMENTS, REFERENCES } from "./measurementData";
import styles from "./MeasurementPanel.module.css";

function MeasurementPanel() {
  const scrollRef = useRef(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    const max = el.scrollHeight - el.clientHeight;
    setScrollRatio(max > 0 ? el.scrollTop / max : 0);
  };

  return (
    <div className={styles.panel}>
      <div ref={scrollRef} className={styles.scroll} onScroll={handleScroll}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.title}>건물·시간대별 측정값 보기</h3>
            <div className={styles.body}>
              <div className={styles.tableBox}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">시간</th>
                      {MEASUREMENT_BUILDINGS.map((building) => (
                        <th key={building} scope="col">
                          {building}
                        </th>
                      ))}
                    </tr>
                    <tr aria-hidden="true">
                      <td colSpan={MEASUREMENT_BUILDINGS.length + 1} className={styles.lineCell}>
                        <img src={tableLine} alt="" />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {MEASUREMENTS.map(({ hour, values }) => (
                      <tr key={hour}>
                        <th scope="row">{hour}</th>
                        {values.map((value, index) => (
                          <td key={MEASUREMENT_BUILDINGS[index]}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.note}>
                ** 성심교정 5개 건물의 10~22시 예비 측정 자료입니다.
                <br />
                <span className={styles.noteIndent}>
                  표시값은 풍력 에너지 밀도(W/m²)이며 실제 발전 전력(W)과 구분됩니다.
                </span>
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.title}>참고 논문</h3>
            <div className={styles.body}>
              <ol className={styles.references}>
                {REFERENCES.map(({ title, url }, index) => (
                  <li key={url}>
                    {index + 1}. {title}
                    <br />-{" "}
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ol>
              <p className={styles.note}>
                ** 배기 흐름을 활용한 에너지 회수의 가능성과 실험 설계를 참고했습니다.
                <br />
                <span className={styles.noteIndent}>
                  논문의 설비·유동 조건은 교내 배기구와 다르므로, 논문의 발전 성능을 교내
                  건물에 그대로 적용하지 않습니다
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className={styles.scrollbar} aria-hidden="true">
        <span
          className={styles.scrollThumb}
          style={{ "--scroll-ratio": scrollRatio }}
        />
      </div>
    </div>
  );
}

export default MeasurementPanel;
