import styles from "./DataCard.module.css";

function DataCard() {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>DATA CARD</h2>

      <div className={styles.card}>
        <div className={styles.list}>
          {/* 내부 카드들(건물 정보, 현재 상태, 최대치, 그래프, 배기구 정보, 최적화 방향)을 여기에 추가 */}
        </div>
      </div>
    </section>
  );
}

export default DataCard;
