import { useEffect, useRef } from "react";
import { cx } from "./cx";

function AdminDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={cx("dialog")}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="admin-dialog-title"
    >
      <div className={cx("dialog-heading")}>
        <h2 id="admin-dialog-title">{title}</h2>
        <button
          type="button"
          className={cx("icon-button")}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

export default AdminDialog;
