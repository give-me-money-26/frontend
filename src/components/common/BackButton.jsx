import { useNavigate } from "react-router";
import backArrow from "../../assets/icons/back-arrow.svg";
import styles from "./BackButton.module.css";

function BackButton({ to }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles.button}
      aria-label="뒤로 가기"
      onClick={() => navigate(to ?? -1)}
    >
      <img src={backArrow} alt="" />
    </button>
  );
}

export default BackButton;
