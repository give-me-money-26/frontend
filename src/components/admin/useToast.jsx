import { useEffect, useState } from "react";
import { cx } from "./cx";

function useToast() {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!text) return;
    const timer = window.setTimeout(() => setText(""), 2800);
    return () => window.clearTimeout(timer);
  }, [text]);
  const node = text ? (
    <div className={cx("toast")} role="status">
      {text}
    </div>
  ) : null;
  return [node, setText];
}

export default useToast;
