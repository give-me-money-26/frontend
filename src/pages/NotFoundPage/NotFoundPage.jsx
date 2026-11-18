import { Link } from "react-router";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <section className={styles.page}>
      <p className={styles.code}>404</p>
      <h2 className={styles.title}>페이지를 찾을 수 없어요</h2>
      <p className={styles.description}>
        주소가 바뀌었거나 없는 페이지예요. 처음 화면에서 다시 시작해 주세요.
      </p>
      <Link to="/" className={styles.home}>
        처음으로
      </Link>
    </section>
  );
}

export default NotFoundPage;
